# Use an official Node.js runtime as the base image
FROM node:20-alpine
 
# Create a non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser
 
# Set the working directory in the container
WORKDIR /app
 
# Change ownership of the working directory to the non-root user
RUN chown -R appuser:appuser /app
 
# Switch to the non-root user
USER appuser
 
# Copy package.json and package-lock.json to the container
COPY --chown=appuser:appuser package*.json ./
 
# Install dependencies (ignoring scripts and legacy peer dependencies)
RUN npm install --ignore-scripts
 
# Copy the rest of the application code to the container
COPY --chown=appuser:appuser . .
 
# Build the React app for production
RUN npm run build
 
# Expose the port where your React app will run
EXPOSE 3000
 
# Define the command to run your React app
CMD ["npm", "run", "start"]
 
 
 