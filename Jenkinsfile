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
                
                // 1. Build Images
                sh 'docker build -t lotus-server ./server'
                sh 'docker build -t lotus-client ./client'
                
                // 2. Clean up old containers & network
                sh 'docker rm -f lotus-server || true'
                sh 'docker rm -f lotus-client || true'
                sh 'docker network create lotus-net || true'

                // 3. Run Server (WITH SECRETS)
                // Note: Connecting to Atlas.
                sh """
                    docker run -d \
                    --name lotus-server \
                    --network lotus-net \
                    --network-alias server \
                    -p 5000:5000 \
                    -e PORT=5000 \
                    -e MONGODB_URI='mongodb+srv://wtdperera2001:s.RhdiPmRi52n5!@lotus.jhbgi0u.mongodb.net/lotus_video?retryWrites=true&w=majority' \
                    -e JWT_SECRET='tharindu_super_secret_key_2026' \
                    lotus-server
                """

                // 4. Run Client
                sh """
                    docker run -d \
                    --name lotus-client \
                    --network lotus-net \
                    -p 3000:3000 \
                    lotus-client
                """
                
                echo "Deployment completed successfully!"
            }
        }
    }
}
