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
        git 'https://github.com/rwirba/devOps-control-tower.git'
      }
    }

    stage('Build & Push Images') {
      parallel {
        stage('Frontend') {
          steps {
            dir('frontend') {
              sh '''
                echo "🛠️ Installing frontend dependencies and building React app..."
                npm install
                npm run build

                echo "📦 Building Docker image for frontend..."
                docker build -t $DOCKER_USER/dct-frontend:latest .
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker push $DOCKER_USER/dct-frontend:latest
              '''
            }
          }
        }

        stage('Backend') {
          steps {
            dir('backend') {
              sh '''
                echo "🛠️ Building backend..."
                docker build -t $DOCKER_USER/dct-backend:latest .
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker push $DOCKER_USER/dct-backend:latest
              '''
            }
          }
        }
      }
    }

    stage('Trivy Scan & Inject') {
      steps {
        dir('backend') {
          sh '''
            echo "🔍 Scanning frontend image..."
            trivy image --severity HIGH,CRITICAL --format json -o trivy-output.json $DOCKER_USER/dct-frontend:latest || true
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
              helm upgrade --install dct-helm . \
                --namespace dct --create-namespace --wait

              echo "🔁 Restarting deployments to pull latest images..."
              kubectl rollout restart deployment dct-backend -n dct
              kubectl rollout restart deployment dct-frontend -n dct
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
