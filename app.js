const express = require("express");
const app = express();
const userRoutes = require("./routes/user.routes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();
const cors = require("cors");
const connectDB = require("./db/db");
connectDB();

const RabbitMQ = require("./service/rabbitmq");
RabbitMQ.connect();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRoutes);

module.exports = app;
