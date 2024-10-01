FROM golang:1.23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go application code into the container
COPY . .

# Command to run the Go app when the container starts
CMD ["go", "run", "main.go"]

# Expose the port 3000 to the outside world
EXPOSE 3000
