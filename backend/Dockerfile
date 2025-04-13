FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY trivy-output.json ./trivy-output.json
EXPOSE 4000
CMD ["node", "index.js","health-check.js"]