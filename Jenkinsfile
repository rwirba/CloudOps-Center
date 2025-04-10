pipeline {
  agent any

  environment {
    DOCKER_CREDS = credentials('dockerhub-creds')
    DOCKER_USER  = "${DOCKER_CREDS_USR}"
    DOCKER_PASS  = "${DOCKER_CREDS_PSW}"
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/rwirba/CloudOps-Center.git'
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

    stage('Trivy Scan & Inject') {
      steps {
        dir('backend') {
          sh '''
            echo "🔍 Scanning frontend image..."
            trivy image --severity HIGH,CRITICAL --format json -o trivy-output.json $DOCKER_USER/cloudops-frontend:latest || true
          '''
        }
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

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          dir('charts') {
            sh '''
              echo "🚀 Deploying DevOps Control Tower using Helm..."
              helm upgrade --install cloudops-center-helm . \
                --namespace cloudops-center --create-namespace --wait

              echo "🔁 Restarting frontend deployment to pull latest image..."
              kubectl rollout restart deployment cloudops-frontend -n cloudops-center  
            '''
          }
        }
      }
    }
  }

  post {
    always {
      echo '🧹 Cleaning Jenkins workspace...'
      cleanWs()
    }
    success {
      echo '✅ DevOps Control Tower deployed successfully!'
    }
    failure {
      echo '❌ Deployment failed. Check logs for more info.'
    }
  }
}
