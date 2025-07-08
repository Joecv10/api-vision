const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pesoFrutas";

function connectDB() {
  return mongoose.connect(MONGO_URI);
}

module.exports = connectDB;
