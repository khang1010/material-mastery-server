#!/bin/bash

# Set your AWS region and ECR repository name
AWS_REGION="ap-southeast-1"
ECR_REPO_NAME="hrforte"
NODE_ENV="staging"
COMMIT_HASH=$(git rev-parse HEAD)
ACCOUNT_ID="647426169344"
REPO_URL=$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Authenticate with AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REPO_URL
# Build the Docker image
docker build -f deployment/staging/docker/Dockerfile -t $ECR_REPO_NAME:$COMMIT_HASH .

# Tag the image
docker tag $ECR_REPO_NAME:$COMMIT_HASH $REPO_URL/$ECR_REPO_NAME:$COMMIT_HASH

# Push the Docker image to AWS ECR
docker push $REPO_URL/$ECR_REPO_NAME:$COMMIT_HASH