FROM node:10
LABEL maintainer="MCU8Apps Team"

WORKDIR /app

COPY package.json .
RUN npm install
COPY . .

# RUN cp entrypoint.sh /usr/local/bin && \
#    chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

# ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "start"]
