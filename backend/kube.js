const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromCluster(); // Uses in-cluster service account

const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

module.exports = {
  coreV1Api,
  appsV1Api
};