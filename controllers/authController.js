// controllers/authController.js
const bcrypt = require("bcryptjs");
const Role = require("../models/Role");
const User = require("../models/User");
const jwtUtils = require("../util/jwtUtils");

const register = async (req, res) => {
  const { firstName, lastName, email, password, role = "buyer" } = req.body;
  let selectedRole = "buyer";
  // Check if a role is provided and it is either 'staff' or 'buyer'
  if (role && (role === "staff" || role === "buyer")) {
    selectedRole = role;
  } else if (role) {
    return res.status(400).json({
      message: 'Invalid role. Only "staff" or "buyer" roles are allowed.',
    });
  }
  const userRole = await Role.findOne({ name: selectedRole });
  if (!userRole) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  });

  try {
    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: savedUser });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ email: username });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwtUtils.generateToken(user.uuid, user.role);

  res.json({ message: "Login successful", token });
};

module.exports = { register, login };
