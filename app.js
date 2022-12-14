const express = require("express");
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const morgan = require("morgan")
const SwaggerUI = require("swagger-ui-express")
const YAML = require("yamljs")
const moment = require("moment")
// const SwaggerJsDoc = require("swagger-jsdoc")
const SwaggerJsDoc = YAML.load("./api.yaml")

const app = express();
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

app.get("/api/v1/", (req, res, next) => {
  res.send("hello client");
});

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

start();
