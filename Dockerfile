FROM node:7.5

RUN mkdir /app

EXPOSE 3000

COPY . /app

WORKDIR /app

RUN npm install

CMD ["npm", "start"]

