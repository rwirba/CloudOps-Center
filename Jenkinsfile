pipeline {
  agent any

  environment {
    DOCKER_CREDS = credentials('dockerhub-creds')      // Docker Hub username/password (stored in Jenkins)
    DOCKER_USER  = "${DOCKER_CREDS_USR}"
    DOCKER_PASS  = "${DOCKER_CREDS_PSW}"
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/rwirba/CloudOps-Center.git'
      }
    }

    stage('Build & Push Backend') {
      steps {
        dir('backend') {
          sh '''
            echo "🛠️ Building backend..."
            docker build -t $DOCKER_USER/cloudops-backend:latest .
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKER_USER/cloudops-backend:latest
          '''
        }
      }
    }

    stage('Build & Push Frontend') {
      steps {
        dir('frontend') {
          sh '''
            echo "🛠️ Installing frontend dependencies and building React app..."
            npm install
            npm run build

            echo "📦 Building Docker image for frontend..."
            docker build -t $DOCKER_USER/cloudops-frontend:latest .
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKER_USER/cloudops-frontend:latest
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          dir('charts') {
            sh '''
              echo "🚀 Deploying CloudOps Center using Helm..."
              helm upgrade --install cloudops-center-helm . \
                --namespace cloudops-center --create-namespace --wait
            '''
          }
        }
      }
    }
  }

  post {
    success {
      echo '✅ CloudOps Center deployed successfully!'
    }
    failure {
      echo '❌ Deployment failed. Check logs for more info.'
    }
  }
}
