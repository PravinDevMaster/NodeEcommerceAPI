const express = require("express");
const {
  getRoles,
  createRole,
  getRoleByUUID,
  updateRoleByUUID,
  deleteRoleByUUID,
} = require("../controllers/roleController");
const {
  authenticateToken,
  checkRolePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// routes
// handling routes path for /api/roles/
router
  .route("/")
  .get(
    authenticateToken,
    checkRolePermission(["super admin"], "read"),
    getRoles
  ) // get request
  .post(
    authenticateToken,
    checkRolePermission(["super admin"], "write"),
    createRole
  ); // post request

// handling routes path for /api/roles/:uuid
router
  .route("/:uuid")
  .get(
    authenticateToken,
    checkRolePermission(["super admin"], "read"),
    getRoleByUUID
  ) //get request
  .put(
    authenticateToken,
    checkRolePermission(["super admin"], "write"),
    updateRoleByUUID
  ) // put request
  .delete(
    authenticateToken,
    checkRolePermission(["super admin"], "write"),
    deleteRoleByUUID
  ); //delete request

module.exports = router;
