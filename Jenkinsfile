pipeline {
    agent any
    tools {
        nodejs 'NodeJS-dashboard'
    }
    environment {
        DOCKER_HUB_CREDENTIALS_ID = 'teche-ai-dockerhub'
        DOCKER_IMAGE_NAME = 'techeai/techedash'
        DOCKER_IMAGE_TAG = 'latest'
        SONARQUBE_ENV = 'SonarQube-Biztech'
        SONAR_PROJECT_KEY = 'Teche-DASHBOARD'
    }

    stages {
        stage('Check Branch') {
            steps {
                script {
                    env.GIT_BRANCH_NAME = env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                    env.DATE_TAG = new Date().format('yyyyMMdd-HHmmss')

                    def allowedBranches = ['development', 'test', 'preprod', 'main']
                    if (!allowedBranches.contains(env.GIT_BRANCH_NAME)) {
                        currentBuild.result = 'NOT_BUILT'
                        error("Skipping build for branch: ${env.GIT_BRANCH_NAME}")
                    }

                    echo "Proceeding with build for branch: ${env.GIT_BRANCH_NAME}"
                }
            }
        }

        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/techeAI/teche-os.git', branch: "${env.GIT_BRANCH_NAME}"
                sh 'rm -rf .next'
                sh 'cp .env.example .env'
                sh 'corepack enable'
                sh 'yarn install'
                sh 'yarn build'
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv("${env.SONARQUBE_ENV}") {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=${env.SONAR_PROJECT_KEY} \
                        -Dsonar.sources=. \
                        -Dsonar.javascript.lcov.reportPaths=lcov.info \
                        -Dsonar.host.url=$SONAR_HOST_URL
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}")
                    sh "docker tag ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} ${env.DOCKER_IMAGE_NAME}:${env.DATE_TAG}"
                    sh "docker tag ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} ${env.DOCKER_IMAGE_NAME}:${env.GIT_BRANCH_NAME}"
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    sh """
                trivy image --severity HIGH,CRITICAL ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} || echo "Trivy scan completed with issues, but build will continue."
                        }
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKER_HUB_CREDENTIALS_ID) {
                        docker.image("${env.DOCKER_IMAGE_NAME}:${env.GIT_BRANCH_NAME}").push()
                        docker.image("${env.DOCKER_IMAGE_NAME}:${env.DATE_TAG}").push()

                        if (env.GIT_BRANCH_NAME == 'main') {
                            docker.image("${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG}").push()
                        }
                    }
                }
            }
        }
    }
}
