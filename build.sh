#!/bin/bash

# Build script for KbStore Admin Docker image
# Usage: ./build.sh

set -e

echo "Building KbStore Admin Docker image..."

# Build the Docker image
docker build -t kbstore-admin:latest .

echo ""
echo "Build complete!"
echo ""
echo "To run the application:"
echo "  docker-compose up"
echo ""
echo "Or run directly with custom API URL:"
echo "  docker run -p 8080:80 -e API_URL=http://your-api:5000/api kbstore-admin:latest"
echo ""
echo "The application will be available at http://localhost:8080"
