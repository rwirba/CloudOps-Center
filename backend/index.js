const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
const { coreV1Api } = require('./kube');
require('dotenv').config();

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// AWS Configuration
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

app.post('/api/start', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stop', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/terminate', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
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
    const data = await iam.listUsers().promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/iam-access-keys/:userName', async (req, res) => {
  const { userName } = req.params;
  try {
    const data = await iam.listAccessKeys({ UserName: userName }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rotate-access-key', async (req, res) => {
  const { userName } = req.body;
  try {
    const data = await iam.createAccessKey({ UserName: userName }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/delete-access-key', async (req, res) => {
  const { userName, accessKeyId } = req.body;
  try {
    const data = await iam.deleteAccessKey({ UserName: userName, AccessKeyId: accessKeyId }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/disable-access-key', async (req, res) => {
  const { userName, accessKeyId } = req.body;
  try {
    const data = await iam.updateAccessKey({
      UserName: userName,
      AccessKeyId: accessKeyId,
      Status: 'Inactive'
    }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Kubernetes Pods (dct namespaces) ===
app.get('/api/pods', async (req, res) => {
  try {
    const result = await coreV1Api.listNamespacedPod('dct'); // just dct Namespace
    res.json(result.body.items);
  } catch (err) {
    console.error('❌ Failed to fetch pods:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pods/:name/restart', async (req, res) => {
  const name = req.params.name;
  const namespace = req.body.namespace || 'dct';
  try {
    await coreV1Api.deleteNamespacedPod(name, namespace);
    res.json({ message: `Restarted pod ${name}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pods/:name/delete', async (req, res) => {
  const name = req.params.name;
  const namespace = req.body.namespace || 'dct';
  try {
    await coreV1Api.deleteNamespacedPod(name, namespace);
    res.json({ message: `Deleted pod ${name}` });
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

app.listen(port, '0.0.0.0', () => {
  console.log(`DevOps Control Tower backend running on port ${port}`);
});

// === Dashboard Stats ===
app.get('/api/stats', async (req, res) => {
  try {
    const pods = await coreV1Api.listNamespacedPod('dct');
    const instances = await ec2.describeInstances().promise();
    const users = await iam.listUsers().promise();
    const trivy = require('./trivy-output.json');

    const ec2Running = instances.Reservations.flatMap(r => r.Instances).filter(i => i.State.Name === 'running').length;
    const ec2Stopped = instances.Reservations.flatMap(r => r.Instances).filter(i => i.State.Name === 'stopped').length;

    const accessKeyAges = users.Users.flatMap(async user => {
      const keys = await iam.listAccessKeys({ UserName: user.UserName }).promise();
      return keys.AccessKeyMetadata.map(k => ({
        days: Math.floor((new Date() - new Date(k.CreateDate)) / (1000 * 60 * 60 * 24))
      }));
    });

    const allAges = await Promise.all(accessKeyAges);
    const flatAges = allAges.flat();

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

    const vulnStats = {
      critical: 0,
      high: 0,
      medium: 0
    };

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
