const express = require("express");
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const morgan = require("morgan")
const SwaggerUI = require("swagger-ui-express")
const YAML = require("yamljs")
const moment = require("moment")


// API rate limiter
const rateLimit = require("express-rate-limit");

// const SwaggerJsDoc = require("swagger-jsdoc")
const SwaggerJsDoc = YAML.load("./api.yaml")

// Request logger
morgan('tiny')
morgan(':method :url :status :res[content-length] - :response-time ms')

morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})

// LOGGER
// https://betterstack.com/community/guides/logging/log-levels-explained/
const winston = require('winston');
const { combine, timestamp, json, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    json(),
    align(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  // transports: [new winston.transports.Console()],
  transports: [
    new winston.transports.File({
      filename: "combined.log"
    })
  ]
});

logger.info('Info message');
logger.error('Error message');
logger.warn('Warning message');


// Node  express Server

const app = express();
/* 

FIXME: allowList does not work, give it a look

*/
const allowlist = ['192.168.0.106', '192.168.0.21']
const apiLimiter = {
  windowMs: 60 * 1000,
  max: 2,
  skip: (request, response) => allowlist.includes(request.ip),
  message: 'Too many accounts created from this IP, please try again after one minute',
  headers: true,
  requestWasSuccessful: (request, response) => response.statusCode < 400,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}

// This config will work for all end-point // max 2 requests 
// app.use(rateLimit(apiLimiter))

const httpServer = createServer(app);
// console.log("Server", httpServer);

const io = new Server(httpServer, {})

app.use("/api-docs", SwaggerUI.serve, SwaggerUI.setup(SwaggerJsDoc))

const tasks = require("./routes/routes");
const user = require("./routes/main");

const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// database connection
const connectDB = require("./db/connect");

require("dotenv").config();

// middleware

app.use(express.json());
app.use(cors())
app.use(morgan("dev"))

// routes
// this end-point will only handle max 2 request tin given time
app.get("/api/v1/", rateLimit(apiLimiter), (req, res, next) => {
  res.json({
    message: "hello client",
    statusCode: 200
  });
});


app.get("/", (req, res) => {
  res.json({
    message: "Hello From Docker.",
    statusCode: 200
  });
})

app.use("/api/v1/tasks", tasks);
app.use("/api/v1/user", user);

app.use(notFound);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const connectedSocketUsers = [];

io.on("connection", (socket) => {
  console.log("new client Connected", socket);
  connectedSocketUsers.push(socket.id)
  console.log(connectedSocketUsers);

  socket.on("disconnect", function(){
    console.log("Client Disconeccted");
  })
  socket.on("emit_event", function(data){
    console.log("Event data:", data);
  })
  setInterval(() => {
    // socket.emit("event_from_server", `${moment().format("LLLL")}`)
    socket.emit("event_from_server", `${moment().format()}`)
  }, 500);
})

io.emit("new_message", "Hello There");


// This is to allow the for CORS from client socket
httpServer.prependListener("request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
});

const start = async () => {
  try {
    await connectDB(
      `mongodb+srv://lazyengineer:${encodeURIComponent(
        MONGO_PASSWORD,
      )}@cluster0.qqu8g.mongodb.net/graphql-mongo-react-app?retryWrites=true&w=majority`,
    );

    // connection without socket

    // app.listen(PORT, () => {
    //   console.log("Connected to mongodb and listening to port:", PORT);
    // });

    //connection With Socket
    httpServer.listen(PORT, () => {
      console.log("Connected to mongodb and listening to port:", PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  start, 
  app
}
