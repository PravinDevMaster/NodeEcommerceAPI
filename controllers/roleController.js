const Role = require("../models/Role");

// create a new role
const createRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;

    // Check the role is already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        status: "error",
        message: "Role already exists.",
      });
    }
    const newRole = new Role({
      name,
      permissions,
    });

    // save the new role to the database
    await newRole.save();

    return res.status(201).json(newRole);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// get all roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    return res.status(200).json(roles);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// get role by UUID
const getRoleByUUID = async (req, res, next) => {
  try {
    const role = await Role.findOne({ uuid: req.params.uuid });
    // check role is not exists.
    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }
    res.status(200).json(role);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// update role by UUID
const updateRoleByUUID = async (req, res, next) => {
  try {
    const updateRole = await Role.findOneAndUpdate(
      { uuid: req.params.uuid }, //filter by uuid
      { $set: req.body }, // update with the request body
      { new: true } // return the updated role
    );

    // check role is not exists.
    if (!updateRole) {
      return res.status(404).json({ message: "Role not found." });
    }
    res.status(200).json(updateRole);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// delete role by UUID
const deleteRoleByUUID = async (req, res, next) => {
  try {
    const deleteRole = await Role.findOneAndDelete({ uuid: req.params.uuid });
    // check the role is exists.
    if (!deleteRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// export above controllers
module.exports = {
  createRole,
  getRoles,
  getRoleByUUID,
  updateRoleByUUID,
  deleteRoleByUUID,
};
