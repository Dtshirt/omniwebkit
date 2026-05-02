export const templates = {
  dockerCompose: {
    name: 'Docker Compose',
    icon: '🐳',
    description: 'Multi-container Docker application setup',
    tags: ['Docker', 'Containers', 'Development'],
    content: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`
  },

  kubernetesDeployment: {
    name: 'Kubernetes Deployment',
    icon: '☸️',
    description: 'Kubernetes deployment configuration',
    tags: ['Kubernetes', 'Deployment', 'Production'],
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: nginx:1.21
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  selector:
    app: web-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer`
  },

  githubActions: {
    name: 'GitHub Actions CI/CD',
    icon: '🔄',
    description: 'Continuous Integration and Deployment workflow',
    tags: ['CI/CD', 'GitHub', 'Automation'],
    content: `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t myapp:\${{ github.sha }} .
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: \${{ secrets.DOCKER_USERNAME }}
        password: \${{ secrets.DOCKER_PASSWORD }}
    
    - name: Push Docker image
      run: |
        docker tag myapp:\${{ github.sha }} myapp:latest
        docker push myapp:\${{ github.sha }}
        docker push myapp:latest`
  },

  awsEcs: {
    name: 'AWS ECS Task Definition',
    icon: '☁️',
    description: 'Amazon ECS container task definition',
    tags: ['AWS', 'ECS', 'Cloud'],
    content: `family: web-app-task
networkMode: awsvpc
requiresCompatibilities:
  - FARGATE
cpu: 256
memory: 512
executionRoleArn: arn:aws:iam::123456789012:role/ecsTaskExecutionRole
taskRoleArn: arn:aws:iam::123456789012:role/ecsTaskRole

containerDefinitions:
  - name: web-app
    image: nginx:latest
    portMappings:
      - containerPort: 80
        protocol: tcp
    essential: true
    logConfiguration:
      logDriver: awslogs
      options:
        awslogs-group: /ecs/web-app
        awslogs-region: us-east-1
        awslogs-stream-prefix: ecs
    environment:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "80"
    secrets:
      - name: DATABASE_URL
        valueFrom: arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/database-url
    healthCheck:
      command:
        - CMD-SHELL
        - curl -f http://localhost:80/health || exit 1
      interval: 30
      timeout: 5
      retries: 3
      startPeriod: 60`
  },

  helmChart: {
    name: 'Helm Chart Values',
    icon: '⚓',
    description: 'Helm chart configuration values',
    tags: ['Helm', 'Kubernetes', 'Package Manager'],
    content: `# Default values for web-app
replicaCount: 3

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: "1.21"

nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}

podSecurityContext:
  fsGroup: 2000

securityContext:
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

nodeSelector: {}

tolerations: []

affinity: {}`
  },

  serverless: {
    name: 'Serverless Framework',
    icon: '⚡',
    description: 'Serverless application configuration',
    tags: ['Serverless', 'AWS Lambda', 'Functions'],
    content: `service: my-serverless-app

provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}
  environment:
    STAGE: \${self:provider.stage}
    REGION: \${self:provider.region}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:\${self:provider.region}:*:table/\${self:provider.stage}-*"

functions:
  api:
    handler: src/handler.api
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true
    environment:
      DATABASE_URL: \${ssm:/myapp/\${self:provider.stage}/database-url}

  scheduled:
    handler: src/handler.scheduled
    events:
      - schedule: rate(1 hour)
    timeout: 300

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: \${self:provider.stage}-users
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST

plugins:
  - serverless-offline
  - serverless-webpack

custom:
  webpack:
    webpackConfig: ./webpack.config.js
    includeModules: true`
  }
};