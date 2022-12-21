FROM node:18
WORKDIR /app
COPY package.json .
#COPY package.json /app
RUN npm install
COPY . .
#COPY . ./
ENV PORT 3000
EXPOSE ${PORT}
CMD [ "node", "server.js" ]