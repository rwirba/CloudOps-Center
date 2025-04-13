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
        checkout scm
      }
    }

    stage('Build & Push Frontend') {
      steps {
        dir('frontend') {
          sh '''
            docker build --no-cache -t $DOCKER_USER/dct-frontend:latest .
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKER_USER/dct-frontend:latest
          '''
        }
      }
    }

    stage('Trivy Scan & Inject') {
      steps {
        dir('backend') {
          sh '''
            echo "🔍 Scanning frontend image with Trivy..."
            trivy image --severity HIGH,CRITICAL --format json -o trivy-output.json $DOCKER_USER/dct-frontend:latest || true
            ls -l trivy-output.json
          '''
        }
      }
    }

    stage('Build & Push Backend') {
      steps {
        dir('backend') {
          sh '''
            docker build --no-cache -t $DOCKER_USER/dct-backend:latest .
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $DOCKER_USER/dct-backend:latest
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          dir('charts') {
            sh '''
              helm upgrade --install dct-helm . \
                --namespace dct --create-namespace --wait

              kubectl rollout restart deployment dct-backend -n dct
              kubectl rollout restart deployment dct-frontend -n dct
            '''
          }
        }
      }
    }
    stage('Health Check') {
      steps {
        sh '''
          echo "🩺 Checking DevOps Control Tower /health..."
          sleep 10  # wait for pod rollout if necessary
          curl -sf http://dct.kihhuf.org/health || {
            echo "❌ Health check failed"; exit 1;
          }
        '''
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
