pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.prod.yml'
        ENV_FILE = '.env.prod'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Recuperation du code depuis GitHub...'
                checkout scm
            }
        }

        stage('Docker Pull') {
            steps {
                echo 'Recuperation des images Docker...'
                sh '''
                    docker pull dixandry/projet-devops-backend:latest
                    docker pull dixandry/projet-devops-frontend:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploiement avec Docker Compose...'
                sh '''
                    docker compose \
                      --env-file ${ENV_FILE} \
                      -f ${COMPOSE_FILE} \
                      up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo 'Verification de l application...'
                sh '''
                    sleep 5
                    docker ps
                    curl -f http://localhost/ > /dev/null
                '''
            }
        }
    }

    post {
        success {
            echo 'Deploiement reussi !'
        }

        failure {
            echo 'Le deploiement a echoue.'
        }
    }
}