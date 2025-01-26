const mongoose = require("mongoose");
const Role = require("./Role");
const { v4: uuidV4 } = require("uuid");

// create user schema
const userSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: () => uuidV4(),
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Please provide a valid email address.",
      ],
    },
    vendors: [{ type: String, default: [] }],
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      validate: {
        // check the role is exists in the roles collection
        validator: async function (value) {
          // check the role is exists in the role collection
          const roleExists = await Role.findOne({
            $or: [{ uuid: value }, { name: value }],
          });
          return roleExists !== null;
        },
        message: (props) =>
          `${props.value} is not a valid role in the role collection`,
      },
    },
    createdBy: { type: String, ref: "User" },
  },
  {
    timestamps: true, //Automatically adds createdAt and updatedAt fields
  }
);

// before saving convert role name to UUID
userSchema.pre("save", async function (next) {
  if (this.isModified("role") || this.isNew) {
    const roleDoc = await Role.findOne({ name: this.role });
    if (roleDoc) {
      this.role = roleDoc.uuid; // Replace role name with UUID
    } else {
      throw new Error(`Role "${this.role}" does not exist.`);
    }
  }
  next();
});

// crate model
const User = mongoose.model("user", userSchema);
module.exports = User;
