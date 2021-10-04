FROM artifacts.microchip.com:7999/microchip/citd/nodejs:12.x

WORKDIR /usr/app

COPY package.json .
RUN npm i --quiet

COPY . .
