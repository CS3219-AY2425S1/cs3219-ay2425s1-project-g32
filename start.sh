#!/bin/bash

# Pull images for code execution
docker pull node:23.1.0-slim
docker pull python:3.9-slim
docker pull gcc:14.2.0
docker pull golang:1.16.5
docker pull rust:1.82.0

docker-compose up --build -d