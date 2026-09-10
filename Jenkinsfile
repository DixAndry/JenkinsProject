```text
pipeline {
    agent any
    tools {
            sonarQube 'SonarScanner'
        }
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

                withSonarQubeEnv('sonarqube') {
                    sh '''
                        sonar-scanner \
                            -Dsonar.projectKey=JenkinsProject \
                            -Dsonar.projectName=JenkinsProject \
                            -Dsonar.sources=backend,frontend \
                            -Dsonar.sourceEncoding=UTF-8
                    '''
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
```
