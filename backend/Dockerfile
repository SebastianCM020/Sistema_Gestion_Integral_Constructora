FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL (Requisito indispensable de Prisma en Alpine Linux)
RUN apk add --no-cache openssl

# Instalar dependencias primero (cache de capas Docker)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

EXPOSE 3001

# nodemon para hot-reload en desarrollo
CMD ["npm", "run", "dev"]
