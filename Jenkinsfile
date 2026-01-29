pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-u root:root'
        }
    }
    
    environment {
        // Environment variables for the pipeline
        NODE_VERSION = '18'
        DOCKER_REGISTRY = 'docker.io'
        PROJECT_NAME = 'lotus-video-platform'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '========================================='
                echo 'Stage: Checkout Code from SCM'
                echo '========================================='
                checkout scm
                echo '✅ Code checked out successfully'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '========================================='
                echo 'Stage: Install Dependencies'
                echo '========================================='
                
                script {
                    // Install server dependencies
                    echo '📦 Installing Server Dependencies...'
                    dir('server') {
                        sh 'npm install'
                    }
                    echo '✅ Server dependencies installed'
                    
                    // Install client dependencies
                    echo '📦 Installing Client Dependencies...'
                    dir('client') {
                        sh 'npm install'
                    }
                    echo '✅ Client dependencies installed'
                }
            }
        }
        
        stage('Test Build') {
            steps {
                echo '========================================='
                echo 'Stage: Test Build - Verify Installation'
                echo '========================================='
                
                script {
                    echo '🔍 Verifying Node.js and npm installation...'
                    sh 'node -v'
                    sh 'npm -v'
                    echo '✅ Node.js and npm verified successfully'
                }
            }
        }
    }
    
    post {
        success {
            echo '========================================='
            echo '🎉 Pipeline completed successfully!'
            echo '========================================='
            echo "✅ All stages passed"
            echo "✅ Code checked out"
            echo "✅ Dependencies installed"
            echo "✅ Test Build verified"
        }
        
        failure {
            echo '========================================='
            echo '❌ Pipeline failed!'
            echo '========================================='
            echo "Please check the logs above for details"
        }
        
        always {
            echo '========================================='
            echo 'Pipeline execution finished'
            echo "Workspace: ${WORKSPACE}"
            echo "Build Number: ${BUILD_NUMBER}"
            echo '========================================='
        }
    }
}
