const express = require("express");
const {
  createUser,
  getAllUsers,
  getUserByUUID,
  updateUser,
  deleteUserByUUID,
  updatePassword,
} = require("../controllers/userController");
const {
  authenticateToken,
  checkRolePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();
// routes
// handle routes path for the /api/user/
router
  .route("/")
  .post(
    authenticateToken,
    checkRolePermission(["super admin", "admin"], "write"),
    createUser
  ) //post request
  .get(
    authenticateToken,
    checkRolePermission(["super admin", "admin"], "read"),
    getAllUsers
  ); // get request

// handle routes path for the /api/user/:uuid
router
  .route("/:uuid")
  .get(
    authenticateToken,
    checkRolePermission(["super admin"], "read"),
    getUserByUUID
  ) //get request
  .put(
    authenticateToken,
    checkRolePermission(["super admin", "admin"], "write"),
    updateUser
  ) // put request
  .delete(
    authenticateToken,
    checkRolePermission(["super admin"], "write"),
    deleteUserByUUID
  ); //delete request

// handle routes path for the /api/user/:uuid/password
router.route("/:uuid/password").put(updatePassword); //put request

// export routers
module.exports = router;
