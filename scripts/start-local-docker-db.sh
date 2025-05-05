# Configuration
DOCKER_CONTAINER_NAME=$1
MYSQL_DATABASE_TYPE=$2
MYSQL_DATABASE_NAME=$3
MYSQL_ROOT_PASSWORD=$4
MYSQL_PORT=$5

echo "🔍 Checking if container '$DOCKER_CONTAINER_NAME' exists..."
DOES_DOCKER_CONTAINER_EXIST=$(docker ps -a --format '{{.Names}}' | grep -w "$DOCKER_CONTAINER_NAME")

if [ "$DOES_DOCKER_CONTAINER_EXIST" ]; then
  echo "✅ Container '$DOCKER_CONTAINER_NAME' already exists."

  HAS_DOCKER_CONTAINER_ALREADY_RUNNING=$(docker ps --format '{{.Names}}' | grep -w "$DOCKER_CONTAINER_NAME")
  if [ "$HAS_DOCKER_CONTAINER_ALREADY_RUNNING" ]; then
    echo "🚀 Container is already running."
  else
    echo "▶️ Starting existing container..."
    docker start "$DOCKER_CONTAINER_NAME"
    echo "✅ Container '$DOCKER_CONTAINER_NAME' started."
  fi
else
  echo "📦 Creating and starting new SQL DB ('$MYSQL_DATABASE_TYPE') container"
  docker run -d \
    --name "$DOCKER_CONTAINER_NAME" \
    -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
    -e MYSQL_DATABASE="$MYSQL_DATABASE_NAME" \
    -p "$MYSQL_PORT:$MYSQL_PORT" \
    $MYSQL_DATABASE_TYPE:latest
  echo "✅ Container '$DOCKER_CONTAINER_NAME' created and started."
fi

echo "🗒️ DB username is 'root'"