pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

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

        stage('SonarQube Analysis') {
            steps {
                echo 'Analyse du code avec SonarQube...'

                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('sonarqube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=JenkinsProject \
                                -Dsonar.projectName=JenkinsProject \
                                -Dsonar.sources=backend,frontend \
                                -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Analyse de securite des dependances...'

                sh '''
                    cd frontend
                    npm audit --audit-level=high
                '''
            }
        }
        stage('Trivy Filesystem Scan') {
            steps {
                echo 'Analyse de securite du projet avec Trivy...'

                sh '''
                    trivy fs \
                        --severity HIGH,CRITICAL \
                        --exit-code 1 \
                        .
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