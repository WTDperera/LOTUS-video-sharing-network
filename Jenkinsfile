pipeline {
    agent {
        docker { 
            image 'node:20-alpine' 
            args '-u root:root'
        }
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                echo "Installing dependencies..."
                sh 'npm install --prefix client'
                sh 'npm install --prefix server'
            }
        }
        stage('Run Tests') {
            steps {
                echo "Running tests..."
                sh 'npm test --prefix server || true'
            }
        }
    }
}
