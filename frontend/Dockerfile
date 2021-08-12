# base image
FROM artifacts.microchip.com:7999/microchip/citd/nodejs:12.x
 
# set working directory
WORKDIR /app
 
# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH
 
RUN apt-get update && apt-get upgrade && \
    apt-get add --no-cache bash git openssh
 
# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install react-scripts@3.4.1 -g
 
COPY . /app
 
# start app
CMD ["npm", "start"]
