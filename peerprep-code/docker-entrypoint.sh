#!/bin/sh

echo "Starting Docker daemon..."
# exec /usr/local/bin/dockerd-entrypoint.sh &
exec /usr/local/bin/dockerd-entrypoint.sh > /dev/null 2>&1 &

# ensure docker is running
sleep 10

npm run start