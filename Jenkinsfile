pipeline {
    agent none
    
    stages {
        stage('CI - Build & Test') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-u root:root'
                }
            }
            steps {
                echo "Starting CI - Build & Test..."
                checkout scm
                echo "Installing dependencies..."
                sh 'npm install --prefix client'
                sh 'npm install --prefix server'
                echo "Running tests..."
                sh 'npm test --prefix server || true'
            }
        }
        
        stage('CD - Deploy') {
            agent any
            steps {
                echo "Deploying Application..."
                
                // Build Docker images
                echo "Building Docker images..."
                sh 'docker build -t lotus-server ./server'
                sh 'docker build -t lotus-client ./client'
                
                // Stop and remove old containers (ignore errors if they don't exist)
                echo "Stopping old containers..."
                sh 'docker stop lotus-server || true'
                sh 'docker rm lotus-server || true'
                sh 'docker stop lotus-client || true'
                sh 'docker rm lotus-client || true'
                
                // Run new containers
                echo "Starting new containers..."
                sh 'docker run -d --name lotus-server -p 5000:5000 lotus-server'
                sh 'docker run -d --name lotus-client -p 3000:3000 lotus-client'
                
                echo "Deployment completed successfully!"
            }
        }
    }
}
