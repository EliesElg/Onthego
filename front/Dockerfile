# Utiliser une version légère de Node.js 18
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances avec --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Construire l'application Angular
RUN npm run build

# Exposer le port pour Angular
EXPOSE 4200

# Lancer le serveur Angular
CMD ["npm", "start"]
