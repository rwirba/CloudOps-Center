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

// === Vulnerabilities (Trivy) ===
app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const raw = require('./trivy-output.json');
    const scanResults = Array.isArray(raw) ? raw : (raw.Results || [raw]);
    const vulnerabilities = scanResults.flatMap(r => r.Vulnerabilities || []);
    res.json(vulnerabilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DevOps Control Tower backend running on port ${port}`);
});
