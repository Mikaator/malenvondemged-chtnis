#!/bin/bash

echo "Starting build process..."

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

# Go back to root
cd ..

echo "Build process completed!"
echo "Checking if build directory exists..."
ls -la client/build/

echo "Build script finished."
