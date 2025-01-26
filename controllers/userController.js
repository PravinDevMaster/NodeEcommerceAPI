const Role = require("../models/Role");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// get roles detail based on the role name
const getRoleDoc = async (roleInput) => {
  try {
    // Fetch the role document using the name
    const roleDoc = await Role.findOne({
      $or: [{ uuid: roleInput }, { name: roleInput }],
    });
    if (!roleDoc) {
      throw new Error(`Role with Name '${roleInput}' does not exist.`);
    }
    return roleDoc;
  } catch (error) {
    throw new Error("Failed to fetch role details.");
  }
};
// create the new user
const createUser = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName = "",
      email,
      password,
      role,
      vendors = [],
    } = req.body;
    const loggedInUserId = req.user.userId; // logged-in user's uuid is in req.user.uuid
    //  validation for vendor-specific fields if the role is "staff"
    if (role === "staff" && (!vendors || vendors.length === 0)) {
      return res.status(400).json({
        message:
          "Vendor-specific fields are required for creating a staff user",
      });
    }
    // get login user role
    const loginUserRole = await Role.findOne({ uuid: req.user.role });
    if (loginUserRole.name === "admin" && role !== "staff") {
      return res.status(403).json({
        message: "You are not authorized to create this type of user",
      });
    }
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // check if user email already exists.
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: `${email} this is already exists.`,
      });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      createdBy: loggedInUserId,
      vendors,
    });

    // get the role details based on the role
    const roleDoc = await getRoleDoc(role);
    // save the new user to the database
    await newUser.save();
    // user response is
    const userRes = newUser.toObject();
    delete userRes.password; // remove the password field for response
    return res.status(201).json({
      ...userRes,
      role: { uuid: roleDoc?.uuid, name: roleDoc?.name },
    });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// get the user based on the user UUID
const getUserByUUID = async (req, res, next) => {
  try {
    const userDoc = await User.findOne({ uuid: req.params.uuid });
    // get the role details based on the role

    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }
    const roleDoc = await getRoleDoc(userDoc?.role);
    // check if user is not exists into the database
    // user response is
    const userRes = userDoc.toObject();
    delete userRes.password; // remove the password field for response
    res.status(200).json({
      ...userRes,
      role: { uuid: roleDoc?.uuid, name: roleDoc?.name },
    });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// get all users
const getAllUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.userId; // logged-in user's uuid is in req.user.uuid
    const loggedInUserRole = await Role.findOne({ uuid: req.user.role }); // logged-in user's role uuid is in req.user.role
    let allowedRoles = [];
    // login user role is admin get staff, vendor, buyer uuid
    if (loggedInUserRole?.name === "admin") {
      const roles = await Role.find({
        name: { $in: ["staff", "buyer", "vendors"] },
      });
      allowedRoles = roles.map((role) => role.uuid); // Get UUIDs of 'staff', 'buyer', 'vendor'
    }

    // Check if the logged-in user is an admin
    let filterCriteria = {};
    if (loggedInUserRole?.name === "admin") {
      // If admin, filter users by allowed role UUIDs
      filterCriteria = { role: { $in: allowedRoles } };
    } else {
      // If not admin, exclude the logged-in user and return all other users
      filterCriteria = { uuid: { $ne: loggedInUserId } };
    }
    // Fetch users based on the filter criteria
    const users = await User.find(filterCriteria);

    // check if no user available into the database
    if (users?.length <= 0 || !users)
      return res.status(404).json({ message: "User not found." });
    // Enrich each user with role details
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const roleDoc = await Role.findOne({ uuid: user.role });
        const { password, ...userWithoutPassword } = user.toObject(); // Exclude password
        return {
          ...userWithoutPassword,
          role: roleDoc
            ? {
                uuid: roleDoc.uuid,
                name: roleDoc.name,
              }
            : null,
        };
      })
    );

    return res.status(200).json(enrichedUsers);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// update user by UUID
const updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    // get login user role
    const loginUserRole = await Role.findOne({ uuid: req.user.role });

    // If the logged-in user is an admin and the target user is not "staff", deny the update
    if (loginUserRole.name === "admin" && req.body.role !== "staff") {
      return res.status(403).json({
        message: "You are not authorized to update this type of user",
      });
    }

    // Ensure the password field is excluded
    delete updates.password;
    const userDoc = await User.findOneAndUpdate(
      { uuid: req.params.uuid }, //filter by uuid
      { $set: updates }, // update with the request body
      { new: true } // return the updated role
    );

    // check if user is not exists into the database
    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }
    // get the role details based on the role
    const roleDoc = await getRoleDoc(userDoc?.role);
    // user response is
    const userRes = userDoc.toObject();
    delete userRes.password; // remove the password field for response
    res.status(200).json({
      ...userRes,
      role: { uuid: roleDoc?.uuid, name: roleDoc?.name },
    });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// delete user by UUID
const deleteUserByUUID = async (req, res, next) => {
  try {
    const userDoc = await User.findOneAndDelete({ uuid: req.params.uuid });
    // check if user is not exists into the database
    if (!userDoc) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// update password
const updatePassword = async (req, res, next) => {
  try {
    const { uuid } = req.params; // User UUID
    const { oldPassword, newPassword } = req.body;

    // Validate input
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new passwords are required" });
    }

    // Find the user by ID
    const user = await User.findOne({ uuid: uuid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createUser,
  getUserByUUID,
  getAllUsers,
  updateUser,
  deleteUserByUUID,
  updatePassword,
};
