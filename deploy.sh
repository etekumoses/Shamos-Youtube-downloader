#!/bin/bash

# ----------------------------
# Set Variables
# ----------------------------
PROJECT_ID="kauntabook-3c1cd"
REGION="us-central1"
REPOSITORY="shamos-youtube-downloader"
IMAGE_NAME="shamos-youtube-downloader-full"
VM_NAME="shamosapps"
ZONE="us-central1-b"
DOCKERFILE_PATH="./Dockerfile"
APP_PORT=2000

# ----------------------------
# Authenticate GCP CLI
# ----------------------------
echo "Authenticating with GCP..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

# ----------------------------
# Build and Push Docker Image
# ----------------------------
echo "Building Docker image..."
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest -f $DOCKERFILE_PATH
if [ $? -ne 0 ]; then
  echo "Docker build failed. Exiting."
  exit 1
fi

echo "Pushing Docker image to Artifact Registry..."
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest
if [ $? -ne 0 ]; then
  echo "Docker push failed. Exiting."
  exit 1
fi

# ----------------------------
# Deploy to VM and Reload NGINX
# ----------------------------
echo "Deploying to VM $VM_NAME..."
gcloud compute ssh $VM_NAME --zone $ZONE --command "
  echo 'Pulling latest Docker image...' &&
  sudo docker pull $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest &&
  sudo docker stop $IMAGE_NAME || true &&
  sudo docker rm $IMAGE_NAME || true &&
  sudo docker system prune -af &&
  sudo docker run -d --name $IMAGE_NAME -p 7000:7000 $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$IMAGE_NAME:latest &&
  echo 'Reloading NGINX...' &&
  sudo systemctl reload nginx
"
if [ $? -ne 0 ]; then
  echo "Deployment failed. Exiting."
  exit 1
fi

# ----------------------------
# Success Message
# ----------------------------
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
echo "Deployment complete!"
echo "Access your application at: http://$EXTERNAL_IP"
