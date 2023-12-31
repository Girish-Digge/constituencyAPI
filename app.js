require("dotenv").config();
require("express-async-errors");

// const path = require("path");
//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const express = require("express");
const app = express();

//connect db
const connectDB = require("./db/connect");

//routers
const authenticateUser = require("./middleware/authentication");
const authRouter = require("./routes/auth");
const complaintsRouter = require("./routes/complaints");
// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
app.set("trust proxy", 1);

// app.use(express.static(path.resolve(__dirname, "./client/dist")));
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());
app.use(helmet());
app.use(xss());

// routes;
app.get("/", (req, res) => {
  res.send("constituency api");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/complaints", authenticateUser, complaintsRouter);

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "./client/dist", "index.html"));
// });
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
