
// docker build . | this command create a docker image from Dockerfile

// docker build -t mern-project . | this command create a named docker image

// docker run -d -p 3000:3000 --name node-project mern-project

// docker image rm image-id | remove docker image

// docker rm -container-id -f | remove docker container

// docker exec -it container-id bash

// bind mount volume
// docker run -v pathtofolderlocation:pathtofoldercontainer -p 3000:3000 -d --name container-name docker-image-name/id

// docker run -v $(pwd):/app -p 3000:3000 -d --name container-name docker-image-name/id

// docker logs container-id

// annonymous volume

// docker run -v $(pwd):/app -v /app/node_modules -p 3000:3000 -d --name container-name docker-image-name/id

// read only bind mount
// docker run -v $(pwd):/app:ro -v /app/node_modules -p 3000:3000 -d --name container-name docker-image-name/id

// Environment variables
// docker run -v $(pwd):/app:ro -v /app/node_modules --env PORT=4000 -p 3000:4000 -d --name container-name docker-image-name/id

// docker run -v $(pwd):/app:ro -v /app/node_modules --env PORT=4000 --env USER_NAME=phossain -p 3000:4000 -d --name container-name docker-image-name/id
/* 
FIXME:
never use bind mount volume in production docker image, if you really want to use it, then make sure your sensitive files/folders are ignored from auto sync
*/

// load .env file instead of seperate env   
// docker run -v $(pwd):/app:ro -v /app/node_modules --env-file pathtoenvfile -p 3000:4000 -d --name container-name docker-image-name/id
// docker run -v $(pwd):/app:ro -v /app/node_modules --env-file ./.env -p 3000:4000 -d --name container-name docker-image-name/id

// docker rm container-id -fv | it will remove the associate volumes too





// Docker Composer 
// docker-compose up -d
// docker-compose up -d --build
// docker-compose down -v

// docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

// docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v