FROM node:18 as dependencies

# Create app directory in the docker container
RUN mkdir -p /app
WORKDIR /app

# Copy packages to docker container
COPY package.json package-lock.json ./

# install dependencides with lockfile
RUN npm ci

FROM node:18 as builder

# Create app directory in docker container
WORKDIR /app

# Copy source code
COPY . .

# Copy dependacies from dependencies builder that is stored in /app directory
COPY --from=dependencies /app/node_modules node_modules

# Build application
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
