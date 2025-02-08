#!/bin/bash

# Install dependencies for Rust and Node.js
echo "Installing dependencies..."

# Install Rust
apt-get update
apt-get install -y curl build-essential
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully."

# Run the server
echo "Starting the server..."
npm start
