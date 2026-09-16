const mongoose = require("mongoose");

async function connectToDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in Backend/.env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = connectToDB;
