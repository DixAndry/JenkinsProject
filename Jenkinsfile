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
        stage('Docker Build') {
            steps {
                echo "Construction des images Docker - version ${BUILD_NUMBER}..."

                sh '''
                    docker build -t dixandry/projet-devops-backend:${BUILD_NUMBER} ./backend
                    docker build -t dixandry/projet-devops-frontend:${BUILD_NUMBER} ./frontend
                '''
            }
        }
        stage('Trivy Image Scan') {
            steps {
                echo "Analyse de securite des images Docker - version ${BUILD_NUMBER}..."

                sh '''
                    trivy image --timeout 30m --severity HIGH,CRITICAL dixandry/projet-devops-backend:${BUILD_NUMBER}

                    trivy image --timeout 30m --severity HIGH,CRITICAL dixandry/projet-devops-frontend:${BUILD_NUMBER}
                '''
            }
        }
        stage('Docker Push') {
            steps {
                echo 'Envoi des images vers Docker Hub...'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

                        docker push dixandry/projet-devops-backend:${BUILD_NUMBER}
                        docker push dixandry/projet-devops-frontend:${BUILD_NUMBER}

                        docker logout
                    '''
                }
            }
        }
        stage('Deploy K3s') {
            steps {
                echo "Déploiement de la version ${BUILD_NUMBER} sur K3s..."

                withCredentials([file(
                    credentialsId: 'k3s-jenkins',
                    variable: 'KUBECONFIG'
                )]) {
                    sh '''
                        echo "=== Mise à jour du Backend ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            set image deployment/backend \
                            backend=dixandry/projet-devops-backend:${BUILD_NUMBER} \
                            -n todolist

                        echo "=== Mise à jour du Frontend ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            set image deployment/frontend \
                            frontend=dixandry/projet-devops-frontend:${BUILD_NUMBER} \
                            -n todolist

                        echo "=== Attente du déploiement Backend ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            rollout status deployment/backend \
                            -n todolist \
                            --timeout=5m

                        echo "=== Attente du déploiement Frontend ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            rollout status deployment/frontend \
                            -n todolist \
                            --timeout=5m

                        echo "=== Pods après déploiement ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            get pods -n todolist

                        echo "=== Images déployées ==="
                        kubectl --kubeconfig="$KUBECONFIG" \
                            get deployments -n todolist \
                            -o custom-columns=NAME:.metadata.name,IMAGE:.spec.template.spec.containers[0].image
                    '''
                }
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