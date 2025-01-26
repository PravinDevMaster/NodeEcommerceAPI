const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// routes
// signup the new user (without token verification)
router.post("/signup", register);

// Login  (with token generation)
router.post("/login", login);

module.exports = router;
