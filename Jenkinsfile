pipeline {
    agent any
    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'teche-ai-dockerhub'	
        DOCKER_IMAGE_NAME = 'techeai/techeos'
        DOCKER_IMAGE_TAG = 'latest'
        DATE_TAG = new Date().format('yyyyMMdd-HHmmss')
    }
    stages {
        stage('Setup') {
            steps {
                sh '''
                curl -fsSL https://deb.nodesource.com/setup_18.x |bash -
                apt-get install -y nodejs
                npm install -g yarn
                '''
          }
        }
        stage('Install dependencies') {
          steps {
            sh 'yarn install'
          }
        }
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/techeAI/teche-os.git', branch: 'main'
                sh 'rm -rf .next'
                sh 'cp .env.example .env'
                sh 'yarn install'
                sh 'yarn build'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}")
                    sh "docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG} ${DOCKER_IMAGE_NAME}:${DATE_TAG}"
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKER_HUB_CREDENTIALS_ID) {
                        def dateimage = docker.image("${env.DOCKER_IMAGE_NAME}:${env.DATE_TAG}")
                        dateimage.push()
                        def image = docker.image("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}")
                        image.push()
                    }
                }
            }
        }
    }
}
