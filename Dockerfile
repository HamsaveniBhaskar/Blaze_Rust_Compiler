# Use a lightweight Node.js image
FROM node:16-slim

# Install Rust, Java JDK, and a linker
RUN apt-get update && apt-get install -y default-jdk-headless curl clang \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Rust
ENV PATH="/root/.cargo/bin:${PATH}"

# Show Rust version
RUN rustc --version

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port and run server
EXPOSE 3000
CMD ["node", "server.js"]
