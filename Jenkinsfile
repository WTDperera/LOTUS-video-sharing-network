pipeline {
    agent {
        docker { 
            image 'node:18-alpine' 
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
        stage('Test Build') {
            steps {
                echo "Verifying installation..."
                sh 'node -v'
                sh 'npm -v'
            }
        }
    }
}
