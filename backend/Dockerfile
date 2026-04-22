FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL (Requisito indispensable de Prisma en Alpine Linux)
# dos2unix para corregir entrypoint.sh si viene con CRLF de Windows
RUN apk add --no-cache openssl dos2unix

# Instalar dependencias primero (cache de capas Docker)
COPY package*.json ./
RUN npm install

# Copiar el resto del código (incluye prisma/schema.prisma)
COPY . .

# Generar el cliente Prisma dentro de la imagen
# Debe ejecutarse DESPUÉS de COPY para tener schema.prisma disponible
RUN npx prisma generate

EXPOSE 3001

# Script de arranque: aplica migraciones pendientes, ejecuta seed si la BD
# está vacía y luego levanta el servidor con hot-reload.
COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh 2>/dev/null || sed -i 's/\r//' /entrypoint.sh \
    && chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
