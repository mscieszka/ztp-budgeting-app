# Development stage
FROM node:18-alpine as development

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the development server
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
