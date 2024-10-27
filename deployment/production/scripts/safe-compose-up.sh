#!/bin/bash

COMMIT_HASH=$(git rev-parse HEAD)
COMMIT_HASH_SHORT=$(git rev-parse --short HEAD)
DOCKER_PATH=deployment/production/docker
IMAGE_NAME=material-mastery
IMAGE_PORT=8083
CURRENT_CONTAINER=$(sudo docker ps --format "{{.Names}}" --filter "name=server*")
RESTART_RETRIES=0
HEALTH_CHECK_RETRIES=0

# Splt name current container name by '-' character
IFS='-' read -ra parts <<< "$CURRENT_CONTAINER"

# The first part after splite container name
CONTAINER_NAME="${parts[0]}"
CURRENT_VERSION="${parts[1]}"
DESIRE_VERSION=$CURRENT_VERSION

if [[ $CONTAINER_NAME == "" || $CONTAINER_NAME == "docker" ]]; then
    CONTAINER_NAME=server
fi

# Switch desire version base on current version
if [[ $CURRENT_VERSION == "blue" ]]; then
    DESIRE_VERSION="green"
else
    DESIRE_VERSION="blue"
fi

sudo docker system prune -a -f
sudo docker build -f $DOCKER_PATH/Dockerfile -t $IMAGE_NAME:$COMMIT_HASH_SHORT .

DESIRE_CONTAINER=$CONTAINER_NAME-$DESIRE_VERSION
echo ✅ Building successfully $IMAGE_NAME:$COMMIT_HASH_SHORT
echo 🫙 Current container: $CURRENT_CONTAINER
echo 🫙 Desire container: $DESIRE_CONTAINER

# Stop desire container first
echo "🧹 Cleanup desire container before running it"
sudo docker stop $DESIRE_CONTAINER
sudo docker rm $DESIRE_CONTAINER

# Wait for the container to completely stop
while [ "$(sudo docker inspect -f '{{.State.Status}}' $DESIRE_CONTAINER)" == "running" ]; do
    # delay 5 seconds
    sleep 5
done

sudo docker run -d \
  --restart always \
  --env CONTAINER_NAME=$DESIRE_CONTAINER \
  --env IMAGE_NAME=$IMAGE_NAME:$COMMIT_HASH_SHORT \
  --env-file .env \
  --name $DESIRE_CONTAINER \
  $IMAGE_NAME:$COMMIT_HASH_SHORT && \
  sudo docker network connect \
    --alias $DESIRE_CONTAINER \
    docker_app-network $DESIRE_CONTAINER

# Wait for the container to completely running or exited
while true; do
    CONTAINER_STATUS=$(sudo docker inspect -f '{{.State.Status}}' "$DESIRE_CONTAINER")

    if [ "$CONTAINER_STATUS" == "running" ]; then
        echo "✅ Container is running successfully."
        break
    elif [ "$CONTAINER_STATUS" == "exited" ]; then
        echo "💔 Container exited with a non-zero status."
        
        echo "Removing desire container: $(sudo docker rm $DESIRE_CONTAINER)"
        
        echo "Done"
        exit 0
    else
        ((RESTART_RETRIES++))
        echo "🔄 Container is still starting or restarting... ($RESTART_RETRIES times)"
    fi

    # delay 5 seconds
    sleep 5
done

# Wait for the container healthcheck
while true; do
    PROJECT_STATUS=$(sudo docker inspect -f '{{.State.Health.Status}}' $DESIRE_CONTAINER)

    if [ "$PROJECT_STATUS" == "healthy" ]; then
        echo "✅ Health check is healthy."

        echo "Replacing Nginx Configure..." 
        sudo sed -i "s/docker-server-1/$DESIRE_CONTAINER/g" deployment/production/nginx-conf/nginx.conf
        echo "🔄 Reloading Nginx config..."
        sudo docker exec webnginx sh -c "nginx -s reload"


        echo "🚦 Stoping previous container: $(sudo docker stop $CURRENT_CONTAINER)"
        echo "␡ Removing previous container: $(sudo docker rm $CURRENT_CONTAINER)"
            
        echo "Done"
        exit 0
    elif [ "$PROJECT_STATUS" == "unhealthy" ]; then
        echo "💔 Health check failed."
        
        echo "=== [㏒] Health check error logs ===" 
        echo $(sudo docker inspect --format "{{json .State.Health }}" $DESIRE_CONTAINER)
        echo "===================================="

        echo "🚦 Stoping desire container: $(sudo docker stop $DESIRE_CONTAINER)"
        
        echo "=== [㏒] 50 lines of the latest error logs ==="
        echo $(sudo docker logs -t --tail 50 $DESIRE_CONTAINER)
        echo "=============================================="
        
        echo "␡ Removing desire container: $(sudo docker rm $DESIRE_CONTAINER)"
        
        echo "Done"
        exit 0
    else
        ((HEALTH_CHECK_RETRIES++))
        echo "🔄 Health check is running... ($HEALTH_CHECK_RETRIES times)"
    fi
    
    # delay 5 seconds
    sleep 5
done