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

app.get('/api/metrics/:instanceId', async (req, res) => {
  const { instanceId } = req.params;
  const params = {
    Namespace: 'AWS/EC2',
    MetricName: 'CPUUtilization',
    Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
    StartTime: new Date(Date.now() - 3600 * 1000),
    EndTime: new Date(),
    Period: 300,
    Statistics: ['Average']
  };
  try {
    const data = await cloudwatch.getMetricStatistics(params).promise();
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

// === IAM Key Rotation Fix ===
app.post('/api/rotate-access-key', async (req, res) => {
  const { userName } = req.body;
  try {
    // Create a new access key
    const newKey = await iam.createAccessKey({ UserName: userName }).promise();

    // Disable old keys if needed
    const keys = await iam.listAccessKeys({ UserName: userName }).promise();
    const activeKeys = keys.AccessKeyMetadata.filter(k => k.AccessKeyId !== newKey.AccessKey.AccessKeyId);

    // Optionally disable or delete old key
    for (const k of activeKeys) {
      await iam.updateAccessKey({
        UserName: userName,
        AccessKeyId: k.AccessKeyId,
        Status: 'Inactive'
      }).promise();
    }

    res.json(newKey);
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
  const spawn = require('child_process').spawn;
  const prune = spawn('sh', ['-c', 'yes | docker system prune -a --volumes']);

  let output = '';
  prune.stdout.on('data', data => output += data.toString());
  prune.stderr.on('data', data => output += data.toString());

  prune.on('close', code => {
    if (code === 0) res.json({ message: '✅ Docker cleaned', output });
    else res.status(500).json({ error: 'Failed to clean Docker', output });
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

// === Trivy Vulnerabilities ===
app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const raw = require('./trivy-output.json');
    const scanResults = Array.isArray(raw) ? raw : (raw.Results || [raw]);

    const vulnerabilities = scanResults.flatMap(result =>
      result.Vulnerabilities?.map(v => ({
        Target: result.Target,
        PkgName: v.PkgName,
        Severity: v.Severity,
        Title: v.Title
      })) || []
    );

    res.json(vulnerabilities);
  } catch (err) {
    console.error('Failed to load vulnerability data:', err.message);
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

// === /api/stats (dashboard design) ===
app.get('/api/stats', async (req, res) => {
  try {
    const instances = await ec2.describeInstances().promise();
    const users = await iam.listUsers().promise();
    const pods = await coreV1Api.listNamespacedPod('dct');
    const trivy = require('./trivy-output.json');

    const flatInstances = instances.Reservations.flatMap(r => r.Instances);
    const ec2Stats = {
      running: flatInstances.filter(i => i.State?.Name === 'running').length,
      stopped: flatInstances.filter(i => i.State?.Name === 'stopped').length
    };

    const accessKeyAges = await Promise.all(
      users.Users.map(async user => {
        const keys = await iam.listAccessKeys({ UserName: user.UserName }).promise();
        return keys.AccessKeyMetadata.map(k => ({
          days: Math.floor((Date.now() - new Date(k.CreateDate)) / (1000 * 60 * 60 * 24))
        }));
      })
    );

    const flatKeys = accessKeyAges.flat();
    const iamStats = {
      active: flatKeys.filter(k => k.days <= 30).length,
      warning: flatKeys.filter(k => k.days > 30 && k.days <= 60).length,
      stale: flatKeys.filter(k => k.days > 60).length
    };

    const podStats = {
      running: pods.body.items.filter(p => p.status.phase === 'Running').length,
      failed: pods.body.items.filter(p => p.status.phase !== 'Running').length
    };

    const flatVulns = Array.isArray(trivy)
      ? trivy.flatMap(r => r.Vulnerabilities || [])
      : (trivy.Results || []).flatMap(r => r.Vulnerabilities || []);

    const vulnStats = {
      critical: flatVulns.filter(v => v.Severity === 'CRITICAL').length,
      high: flatVulns.filter(v => v.Severity === 'HIGH').length,
      medium: flatVulns.filter(v => v.Severity === 'MEDIUM').length
    };

    res.json({
      ec2: ec2Stats,
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
