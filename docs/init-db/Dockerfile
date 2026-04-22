FROM postgres:17-alpine

# Instalar dos2unix para corregir CRLF → LF en entornos Windows
RUN apk add --no-cache dos2unix

# Copiar el script de inicialización y convertir terminaciones de línea
COPY 01_restore.sh /docker-entrypoint-initdb.d/01_restore.sh
RUN dos2unix /docker-entrypoint-initdb.d/01_restore.sh \
    && chmod +x /docker-entrypoint-initdb.d/01_restore.sh

# base.dump se monta como volumen en runtime (archivo binario grande,
# no se copia en la imagen para mantener el tamaño reducido)
