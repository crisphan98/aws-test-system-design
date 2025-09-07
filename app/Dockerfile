FROM node:20
WORKDIR /usr/src/app
COPY server.js .
RUN npm init -y && npm install express mysql2
CMD ["node", "server.js"]
