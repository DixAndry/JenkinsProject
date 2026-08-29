pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Recuperation du code depuis GitHub...'
                checkout scm
            }
        }

        stage('Backend Test') {
            steps {
                echo 'Test du backend FastAPI...'

                sh '''
                    cd backend
                    python3 -m compileall .
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                echo 'Build du frontend React...'

                sh '''
                    cd frontend
                    npm install
                    npm run build
                '''
            }
        }
    }

    post {
        success {
            echo 'CI Jenkins terminee avec succes !'
        }

        failure {
            echo 'La pipeline CI a echoue.'
        }
    }
}