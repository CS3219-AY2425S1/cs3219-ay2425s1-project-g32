# Use the official Docker-in-Docker image
FROM docker:20.10-dind

# Install Node.js
RUN apk add nodejs npm

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Copy the docker-entrypoint.sh script and make it executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose the necessary ports
EXPOSE 1234
EXPOSE 9000

# Use the entrypoint script as the start command for the container
CMD ["/app/docker-entrypoint.sh"]
