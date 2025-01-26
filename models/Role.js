const mongoose = require("mongoose");
const { v4: uuidV4, validate } = require("uuid");

// role schema
const roleSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidV4(),
    },
    name: {
      type: String,
      required: [true, "Role is required."],
      unique: true, //ensure the role is unique
    },
    permissions: {
      type: [String],
      default: ["read"],
      enum: ["create", "read", "update", "delete"], //enum validation for role based access permission
      validate: [
        {
          // check if all permission are valid from the enum list
          validator: function (value) {
            return value.every((permission) =>
              ["create", "read", "update", "delete"].includes(permission)
            );
          },
          message: (props) => `${props.value} is not a valid permission!`,
        },
        {
          validator: function (value) {
            // Check duplicate values in the array
            const uniquePermission = new Set(value); // remove duplications
            return uniquePermission?.size === value?.length;
          },
          message: "Permissions array cannot allow duplicate values.",
        },
      ],
    },
  },
  {
    timestamps: true, //Automatically adds createdAt and updatedAt fields
  }
);
// create model
const Role = mongoose.model("role", roleSchema);
module.exports = Role;
