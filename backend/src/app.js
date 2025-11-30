require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const routes = require("./routes/index.routes");
const errorHandler = require("./utils/errorHandler.util");

const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // frontend (Vite)
  credentials: true, // allow cookies & auth headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(cookieParser());

app.get("/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
