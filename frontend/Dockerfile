# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install app dependencies
RUN npm install

# Build your Remix React app (adjust the build command to your specific setup)
RUN npm run build

# Start your Remix app (adjust the start command to your specific setup)
CMD ["npm", "start"]
