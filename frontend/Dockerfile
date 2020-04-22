# base image
FROM node:12.2.0-alpine
LABEL maintainer="MCU8Apps Team"

ENV PATH /app/node_modules/.bin:$PATH

WORKDIR /app

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

COPY package.json /app/package.json
RUN npm install /app
RUN npm install react-scripts@3.0.1 -g

COPY . /app

COPY entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
