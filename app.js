const express = require("express");
const app = express();

const tasks = require("./routes/routes");
const user = require("./routes/main");

const notFound = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// database connection
const connectDB = require("./db/connect");

require("dotenv").config();

// middleware

app.use(express.json());

// routes

app.get("/", (req, res, next) => {
  res.send("hello client");
});

app.use("/api/v1/tasks", tasks);
app.use("/api/v1/user", user);

app.use(notFound);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

const start = async () => {
  try {
    await connectDB(
      `mongodb+srv://lazyengineer:${encodeURIComponent(
        MONGO_PASSWORD,
      )}@cluster0.qqu8g.mongodb.net/graphql-mongo-react-app?retryWrites=true&w=majority`,
    );
    app.listen(PORT, () => {
      console.log("Connected to mongodb and listening to port:", PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
