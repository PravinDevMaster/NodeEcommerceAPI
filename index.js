const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express(); //Initialize the express
dotenv.config();

app.use(express.json()); //Parse JSON request bodies
app.use(cors()); //Enable Cross-Origin resource sharing

// Connect db
connectDB(); // call the mongodb connection function

// Routes
app.use("/api/roles", require("./routes/roleRouter")); //manage roles routes
app.use("/api/user", require("./routes/userRouter")); // manage user routes
app.use("/api/product", require("./routes/productRouter")); // manage product routes
app.use("/api/auth", require("./routes/authRouter")); // manage auth routes

// Error handling
app.use(errorHandler);

//start server
const PORT = process.env.PORT || 5000; // running port get from the .env file and default is 5000
app.listen(PORT, () => console.log("server is running"));
