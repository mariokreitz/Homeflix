# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Display Angular project structure for debugging
RUN echo "Angular project structure:" && ls -la

# Build the application with production configuration
RUN npm run build -- --configuration=production

# Display build output for debugging
RUN echo "Build output:" && ls -la dist/

# Serve stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
# More flexible approach to handle different Angular output paths
COPY --from=build /app/dist/*/browser /usr/share/nginx/html
# Fallback if the above pattern doesn't match
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
