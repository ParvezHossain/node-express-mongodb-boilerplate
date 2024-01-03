// server.js

/* Dependencies
express: Fast, unopinionated, minimalist web framework for Node.js.
http: Built-in Node.js module for creating HTTP servers.
cors: Middleware to enable Cross-Origin Resource Sharing (CORS) for handling requests from different origins.
morgan: HTTP request logger middleware for Node.js.
helmet: Middleware to enhance the security of Express applications by setting various HTTP headers.
express-rate-limit: Middleware to limit repeated requests to public APIs and/or endpoints.
swagger-ui-express: Middleware to serve Swagger UI for visualizing and interacting with API documentation.
yamljs: A library to parse YAML files.
socket.io: Library for enabling real-time, bidirectional communication between clients and the server using web sockets.
winston: A versatile logging library for Node.js.
moment: A library for parsing, manipulating, and formatting dates and times.

Modules and Middleware

tasks: Module that handles routes related to tasks.
user: Module that handles routes related to users.
notFound: Middleware to handle requests for non-existent routes.
errorHandlerMiddleware: Middleware to handle errors and send appropriate responses.
connectDB: Module responsible for connecting to the database.
startRedis: Function to start the Redis client.

Server Setup

Creates an instance of the Express application.
Creates an HTTP server using createServer from the http module.
Creates an instance of the Socket.IO server using Server from the socket.io module.
Configures Express middleware:
helmet: Enhances the security of the application by setting various HTTP headers.
express.json(): Parses incoming JSON payloads.
cors: Enables Cross-Origin Resource Sharing (CORS) for handling requests from different origins.
morgan: Logs HTTP requests to the console.
Sets up rate limiting for API requests using express-rate-limit.
Mounts the Swagger UI middleware to serve the API documentation.
Mounts the tasks and user modules to handle specific routes.
Mounts the notFound middleware to handle requests for non-existent routes.
Mounts the errorHandlerMiddleware middleware to handle errors.

Socket.IO Setup

Defines an array connectedSocketUsers to store the IDs of connected socket clients.
Handles socket connection events (connection, disconnect, emit_event) and emits events to clients.

Server Start

Connects to the database using the connectDB module.
Starts the Redis client using the startRedis function.
Starts the HTTP server and listens on the specified port.
Please note that the code provided is a simplified overview, and there may be additional configuration or functionality specific to your application in other files.

 */


const express = require("express");
const { createServer } = require("http");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const SwaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const { Server } = require("socket.io");
const winston = require("winston");
const moment = require("moment");
const tasks = require("./routes/routes");
const user = require("./routes/main");
const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const { startRedis } = require("redis");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

const helmetOptions = {
  referrerPolicy: {
    policy: "no-referrer",
    contentSecurityPolicy: false,
  },
};

app.use(helmet(helmetOptions));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// API rate limiter
const allowlist = ["192.168.0.106", "192.168.0.21"];
const apiLimiter = {
  windowMs: 60 * 1000,
  max: 2,
  skip: (request, response) => allowlist.includes(request.ip),
  message: "Too many accounts created from this IP, please try again after one minute",
  headers: true,
  requestWasSuccessful: (request, response) => response.statusCode < 400,
  standardHeaders: true, 
  legacyHeaders: false, 
};

app.use(rateLimit(apiLimiter));
app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(YAML.load("./api.yaml")));
app.use("/api/v1/tasks", tasks);
app.use("/api/v1/user", user);
app.use(notFound);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const connectedSocketUsers = [];

io.on("connection", (socket) => {
  console.log("new client Connected", socket);
  connectedSocketUsers.push(socket.id);
  console.log(connectedSocketUsers);

  socket.on("disconnect", function () {
    console.log("Client Disconeccted");
  });
  socket.on("emit_event", function (data) {
    console.log("Event data:", data);
  });
  setInterval(() => {
    socket.emit("event_from_server", moment().format());
  }, 500);
});

io.emit("new_message", "Hello There");

httpServer.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

const start = async () => {
  try {
    await connectDB(
      `mongodb+srv://lazyengineer:${encodeURIComponent(MONGO_PASSWORD)}@cluster0.qqu8g.mongodb.net/graphql-mongo-react-app?retryWrites=true&w=majority`
    );

    await startRedis();

    httpServer.listen(PORT, () => {
      console.log("Connected to mongodb and listening to port:", PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
