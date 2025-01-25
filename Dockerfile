# Usa una imagen base de Node.js
FROM node:18

# Instala las dependencias del sistema necesarias para Puppeteer o similares
RUN apt-get update && apt-get install -y \
  chromium \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libatspi2.0-0 \
  libgtk-3-0 \
  && apt-get clean

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia el archivo package.json y package-lock.json
COPY package*.json ./

# Establece la variable de entorno para omitir la descarga de Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos de tu aplicación al contenedor
COPY . .

# Expone el puerto en el que tu backend escucha (Render detectará automáticamente el puerto)
EXPOSE 3000

# Comando para iniciar tu backend
CMD ["npm", "start"]
