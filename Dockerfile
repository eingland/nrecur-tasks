# Choose the Image which has Node installed already
FROM node:18-alpine

# COPY all the files from Current Directory into the Container
COPY ./ ./

# Install the Project Dependencies like Express Framework
RUN npm install

# Default Command to launch the Application
CMD ["npm", "start"]