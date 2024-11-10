FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code to the working directory
COPY . .

# Expose the necessary ports
EXPOSE 1234
EXPOSE 9000

# Use the entrypoint script as the start command for the container
CMD ["npm", "run", "start-all"]
