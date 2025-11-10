# Dockerfile para Clinica-backend
# Imagen base ligera con Node.js
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json primero para aprovechar caché de Docker
COPY package.json package-lock.json* ./

# Instalar dependencias de producción
RUN npm install --production \
	&& npm cache clean --force

# Copiar el resto del código
COPY . .

# Ajustes de permisos: ejecutar como usuario no root
RUN chown -R node:node /usr/src/app

USER node

# Variables de entorno por defecto (pueden sobreescribirse desde docker-compose/.env)
ENV NODE_ENV=production
ENV PORT=4000

# Exponer puerto de la app
EXPOSE 4000

# Comando por defecto
CMD ["node", "src/index.js"]

