const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const os = require('os');
const { exec } = require('child_process');
const { coreV1Api } = require('./kube');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

AWS.config.update({ region: 'us-east-1' });
const ec2 = new AWS.EC2();
const cloudwatch = new AWS.CloudWatch();
const iam = new AWS.IAM();
const s3 = new AWS.S3();

// === EC2 Instances ===
app.get('/api/instances', async (req, res) => {
  try {
    const data = await ec2.describeInstances().promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === IAM Users & Access Keys ===
app.get('/api/iam-users', async (req, res) => {
  try {
    const userData = await iam.listUsers().promise();
    const enrichedUsers = await Promise.all(userData.Users.map(async user => {
      const keys = await iam.listAccessKeys({ UserName: user.UserName }).promise();
      return { ...user, AccessKeys: keys.AccessKeyMetadata };
    }));
    res.json({ Users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === K8s Pods & Logs ===
app.get('/api/pods', async (req, res) => {
  try {
    const result = await coreV1Api.listNamespacedPod('dct');
    res.json(result.body.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/pods/:name/logs', async (req, res) => {
  const { name } = req.params;
  const namespace = req.query.namespace || 'dct';
  try {
    const logResp = await coreV1Api.readNamespacedPodLog(name, namespace, undefined, true, false, 500);
    res.send(logResp.body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Docker Cleanup ===
app.post('/api/docker/prune', (req, res) => {
  exec('docker system prune -a --volumes -f', (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: stderr });
    res.json({ message: 'Docker cleanup completed', output: stdout });
  });
});

// === Node System Info ===
app.get('/api/node-metrics', async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0];
    const cpuCount = os.cpus().length;
    const pods = await coreV1Api.listNamespacedPod('dct');
    const podCount = pods.body.items.length;

    res.json({
      hostname: os.hostname(),
      memory: {
        total: totalMem,
        used: usedMem,
        percent: Math.round((usedMem / totalMem) * 100)
      },
      cpu: {
        cores: cpuCount,
        load: cpuLoad,
        percent: Math.round((cpuLoad / cpuCount) * 100)
      },
      pods: podCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === S3 Buckets ===
app.get('/api/s3-buckets', async (req, res) => {
  try {
    const data = await s3.listBuckets().promise();
    res.json(data.Buckets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const pods = await coreV1Api.listNamespacedPod('dct');
    const instances = await ec2.describeInstances().promise();
    const users = await iam.listUsers().promise();
    const trivy = require('./trivy-output.json');

    const ec2Running = instances.Reservations.flatMap(r => r.Instances).filter(i => i.State.Name === 'running').length;
    const ec2Stopped = instances.Reservations.flatMap(r => r.Instances).filter(i => i.State.Name === 'stopped').length;

    const accessKeyAges = await Promise.all(users.Users.map(async user => {
      const keys = await iam.listAccessKeys({ UserName: user.UserName }).promise();
      return keys.AccessKeyMetadata.map(k => ({
        days: Math.floor((new Date() - new Date(k.CreateDate)) / (1000 * 60 * 60 * 24))
      }));
    }));

    const flatAges = accessKeyAges.flat();
    const iamStats = {
      active: flatAges.filter(k => k.days <= 30).length,
      warning: flatAges.filter(k => k.days > 30 && k.days <= 60).length,
      stale: flatAges.filter(k => k.days > 60).length
    };

    const podStats = {
      running: pods.body.items.filter(p => p.status.phase === 'Running').length,
      failed: pods.body.items.filter(p => p.status.phase === 'Failed').length,
      terminated: pods.body.items.filter(p => ['Succeeded', 'Unknown'].includes(p.status.phase)).length
    };

    const vulnStats = { critical: 0, high: 0, medium: 0 };
    const flatVulns = Array.isArray(trivy)
      ? trivy.flatMap(r => r.Vulnerabilities || [])
      : (trivy.Results || []).flatMap(r => r.Vulnerabilities || []);

    flatVulns.forEach(v => {
      if (v.Severity === 'CRITICAL') vulnStats.critical++;
      else if (v.Severity === 'HIGH') vulnStats.high++;
      else if (v.Severity === 'MEDIUM') vulnStats.medium++;
    });

    res.json({
      ec2: { running: ec2Running, stopped: ec2Stopped },
      iam: iamStats,
      pods: podStats,
      vuln: vulnStats
    });
  } catch (err) {
    console.error('❌ /api/stats failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DevOps Control Tower backend running on port ${port}`);
});
