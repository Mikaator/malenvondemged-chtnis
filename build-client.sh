#!/bin/bash

echo "Starting client build process..."

# Install server dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install

# Build client
echo "Building client..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "Build successful! Contents:"
    ls -la build/
else
    echo "Build failed - no build directory found"
    exit 1
fi

# Go back to root
cd ..

echo "Client build process completed!"
