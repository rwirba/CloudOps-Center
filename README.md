# CloudOps Center

CloudOps Center is a web-based DevOps portal that allows you to manage and monitor AWS resources such as EC2 instances and IAM users. It provides a secure frontend/backend interface deployed in Kubernetes, configured via Helm charts, and exposed through Ingress with domain routing.

---

## 🚀 Features
- React frontend and Node.js backend
- AWS EC2 monitoring, start/stop/terminate
- IAM user access key rotation
- CloudWatch CPU metrics
- Dockerized and Helm-deployable
- NGINX Ingress support
- DNS-ready for browser access

---

## 🧱 Project Structure
```
CloudOps-Center/
├── backend/                  # Node.js Express API for AWS management
├── frontend/                 # React UI for dashboard
├── charts/cloudops-center/  # Helm chart for Kubernetes deployment
└── README.md
```

---

## 🔧 Prerequisites
- Kubernetes cluster (via Rancher or self-managed)
- Ingress controller installed (NGINX)
- Helm 3 installed
- Docker images pushed to Docker Hub (private or public)
- Subdomain (e.g., `cloudops-center.kihhuf.org`) configured to point to Ingress IP

---

## ⚙️ Setup Instructions

### 1. Clone This Repo
```bash
git clone https://github.com/<your-org>/CloudOps-Center.git
cd CloudOps-Center
```

### 2. Build and Push Docker Images
```bash
# Backend
cd backend
docker build -t <your-dockerhub>/cloudops-backend:latest .
docker push <your-dockerhub>/cloudops-backend:latest

# Frontend
cd ../frontend
npm install
npm run build
docker build -t <your-dockerhub>/cloudops-frontend:latest .
docker push <your-dockerhub>/cloudops-frontend:latest
```

### 3. Install NGINX Ingress Controller (if not already)
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

### 4. Create AWS Credentials Secret
```bash
kubectl -n cloudops-center create secret generic cloudops-secret \
  --from-literal=AWS_ACCESS_KEY_ID=<your-access-key> \
  --from-literal=AWS_SECRET_ACCESS_KEY=<your-secret-key>
```

### 5. Create DockerHub Pull Secret (for private repos)
```bash
kubectl -n cloudops-center create secret docker-registry dockerhub-auth \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<your-dockerhub-username> \
  --docker-password='<your-password>' \
  --docker-email=<your-email>
```

### 6. Deploy with Helm
```bash
helm upgrade --install cloudops-center charts/cloudops-center \
  --namespace cloudops-center --create-namespace
```

---

## 🌐 DNS Setup

1. In GoDaddy (or your DNS provider), add an A record:
   - **Name**: `cloudops-center`
   - **Type**: `A`
   - **Value**: <Ingress Controller Public IP>

2. Wait for DNS propagation and access the app:
```
http://cloudops-center.kihhuf.org
```

---

## 📦 Additional Enhancements
- 🔐 Add HTTPS via cert-manager and Let's Encrypt
- 🤖 Add GitHub Actions to build/push images automatically
- 🔄 Switch to external secrets (Vault, AWS Secrets Manager)
- 📊 Add metrics UI with Chart.js or Recharts

---

## 🤝 Contributing
Pull requests welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📜 License
[MIT](LICENSE)
