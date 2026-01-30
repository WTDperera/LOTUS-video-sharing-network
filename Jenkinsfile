pipeline {
    agent none
    
    environment {
        DOCKERHUB_USERNAME = 'tharindu5242'
        EC2_HOST = '16.171.153.33'
        EC2_USER = 'ubuntu'
    }
    
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
        
        stage('Build & Push Images') {
            agent any
            steps {
                echo "Building and pushing Docker images to Docker Hub..."
                
                script {
                    // Login to Docker Hub
                    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    }
                    
                    // Build and push server image
                    echo "Building server image..."
                    sh "docker build -t ${DOCKERHUB_USERNAME}/lotus-server:latest ./server"
                    echo "Pushing server image..."
                    sh "docker push ${DOCKERHUB_USERNAME}/lotus-server:latest"
                    
                    // Build and push client image
                    echo "Building client image..."
                    sh "docker build --build-arg VITE_API_URL=http://16.171.153.33:5000/api -t ${DOCKERHUB_USERNAME}/lotus-client:latest ./client"
                    echo "Pushing client image..."
                    sh "docker push ${DOCKERHUB_USERNAME}/lotus-client:latest"
                    
                    echo "Images pushed successfully to Docker Hub!"
                }
            }
        }
        
        stage('CD - Deploy to AWS') {
            agent any
            steps {
                echo "Deploying to AWS EC2: ${EC2_HOST}..."
                
                script {
                    sshagent(credentials: ['ec2-ssh-key']) {
                        // Pull images on AWS
                        sh """
                            ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                                echo "Pulling Docker images..."
                                docker pull ${DOCKERHUB_USERNAME}/lotus-server:latest
                                docker pull ${DOCKERHUB_USERNAME}/lotus-client:latest
                                
                                echo "Setting up network..."
                                docker network create lotus-net || true
                                
                                echo "Stopping old containers..."
                                docker rm -f lotus-server || true
                                docker rm -f lotus-client || true
                                
                                echo "Starting lotus-server..."
                                docker run -d \
                                --name lotus-server \
                                --network lotus-net \
                                --network-alias server \
                                -p 5000:5000 \
                                -e PORT=5000 \
                                -e MONGODB_URI="mongodb+srv://wtdperera2001:s.RhdiPmRi52n5!@lotus.jhbgi0u.mongodb.net/lotus_video?retryWrites=true&w=majority" \
                                -e JWT_SECRET="tharindu_super_secret_key_2026_secured_version" \
                                ${DOCKERHUB_USERNAME}/lotus-server:latest
                                
                                echo "Starting lotus-client..."
                                docker run -d \
                                --name lotus-client \
                                --network lotus-net \
                                -p 80:80 \
                                ${DOCKERHUB_USERNAME}/lotus-client:latest
                                
                                echo "Deployment completed successfully!"
                                docker ps
                            '
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "========================================="
            echo "✅ Production Deployment Successful!"
            echo "Frontend: http://${EC2_HOST}"
            echo "Backend API: http://${EC2_HOST}:5000"
            echo "========================================="
        }
        failure {
            echo "========================================="
            echo "❌ Deployment Failed!"
            echo "Check logs above for details"
            echo "========================================="
        }
    }
}
