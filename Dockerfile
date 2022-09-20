FROM node:8.11.2-alpine
	
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
RUN chown -R root:root /usr/src/app &&\
 chmod -R g+rw /usr/src/app
EXPOSE 8080
CMD [ "npm", "start" ]