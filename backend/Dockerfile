FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && chmod 777 /app/logs

COPY . .

ARG DATABASE_URL
ARG REDIS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL

RUN npx prisma generate

EXPOSE 5500

CMD ["node", "server.js"]