# Choose the Image which has Node installed already
FROM node:18-alpine

# Set timezone
ENV TZ America/Chicago
RUN apk add --no-cache alpine-conf
RUN setup-timezone -z TZ
RUN apk del alpine-conf

# COPY all the files from Current Directory into the Container
COPY ./ ./

# Install the Project Dependencies like Express Framework
RUN npm install

# Default Command to launch the Application
CMD ["npm", "start"]