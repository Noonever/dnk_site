FROM node:18

WORKDIR /src
COPY . /src

RUN npm cache clean --force
RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]