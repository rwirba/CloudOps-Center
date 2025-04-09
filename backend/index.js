const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');
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

app.get('/instances', async (req, res) => {
  try {
    const data = await ec2.describeInstances().promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/terminate', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.terminateInstances({ InstanceIds: [instanceId] }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/stop', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.stopInstances({ InstanceIds: [instanceId] }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/start', async (req, res) => {
  const { instanceId } = req.body;
  try {
    const data = await ec2.startInstances({ InstanceIds: [instanceId] }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/metrics/:instanceId', async (req, res) => {
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

app.get('/iam-users', async (req, res) => {
  try {
    const data = await iam.listUsers().promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rotate-access-key', async (req, res) => {
  const { userName } = req.body;
  try {
    const newKey = await iam.createAccessKey({ UserName: userName }).promise();
    res.json(newKey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/delete-access-key', async (req, res) => {
  const { userName, accessKeyId } = req.body;
  try {
    const data = await iam.deleteAccessKey({ UserName: userName, AccessKeyId: accessKeyId }).promise();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`CloudOps Center backend running on port ${port}`);
});