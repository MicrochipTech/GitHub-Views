# base image
FROM node:12.2.0-alpine
LABEL maintainer="MCU8Apps Team"

ENV PATH /app/node_modules/.bin:$PATH

WORKDIR /app

COPY package.json /app/package.json
RUN npm install /app

COPY . /app

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]