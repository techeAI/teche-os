pipeline {
    agent any
    tools {
        nodejs 'NodeJS-dashboard' // <-- Name from the Global Tool Configuration
    }
    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'teche-ai-dockerhub'	
        DOCKER_IMAGE_NAME = 'techeai/techedash'
        DOCKER_IMAGE_TAG = 'latest'
    }

    stages {
        stage('Set Date Tag') {
            steps {
                script {
                    // Set DATE_TAG dynamically in script context
                    env.DATE_TAG = new Date().format('yyyyMMdd-HHmmss')
                }
            }
        }

        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/techeAI/teche-os.git', branch: 'main'
                sh 'rm -rf .next'
                sh 'cp .env.example .env'
                sh 'corepack enable'
                sh 'yarn install'
                sh 'yarn build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}")
                    sh "docker tag ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} ${env.DOCKER_IMAGE_NAME}:${env.DATE_TAG}"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKER_HUB_CREDENTIALS_ID) {
                        docker.image("${env.DOCKER_IMAGE_NAME}:${env.DATE_TAG}").push()
                        docker.image("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}").push()
                    }
                }
            }
        }
    }
}