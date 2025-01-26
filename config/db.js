const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // mongodb connection using mongoose
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongodb connection successfully");
  } catch (error) {
    console.error("Mongodb connection failed ", error.message);
    process.exit(1); //if database connection is failed exit the application
  }
};

module.exports = connectDB;
