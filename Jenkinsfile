pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.prod.yml'
        ENV_FILE = '.env.prod'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Récupération du code depuis GitHub...'
                checkout scm
            }
        }

        stage('Docker Pull') {
            steps {
                echo 'Récupération des images Docker...'
                sh '''
                    docker pull dixandry/projet-devops-backend:latest
                    docker pull dixandry/projet-devops-frontend:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Déploiement avec Docker Compose...'
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
                echo 'Vérification de l'application...'
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
            echo 'Déploiement réussi !'
        }

        failure {
            echo 'Le déploiement a échoué.'
        }
    }
}