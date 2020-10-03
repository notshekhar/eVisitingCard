FROM node:12

WORKDIR /

COPY package.json .

RUN npm install 

EXPOSE 3000

CMD ["node", "server"]

COPY . . 


