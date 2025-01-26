const express = require("express");
const {
  getAllProducts,
  createProduct,
  getProductByUUId,
  updateProduct,
  deleteProductByUUID,
} = require("../controllers/productController");
const {
  authenticateToken,
  checkRolePermission,
} = require("../middleware/authMiddleware");
const router = express.Router();

// routes
// handling routes path for /api/product/
router
  .route("/")
  .get(
    authenticateToken,
    checkRolePermission(
      ["super admin", "admin", "staff", "buyer", "vendors"],
      "read"
    ),
    getAllProducts
  ) //get request
  .post(
    authenticateToken,
    checkRolePermission(["super admin", "admin", "staff", "vendors"], "write"),
    createProduct
  ); // post request

// routes
// handling routes path for /api/product/:uuid
router
  .route("/:uuid")
  .get(
    authenticateToken,
    checkRolePermission(["super admin"], "read"),
    getProductByUUId
  ) //get request
  .put(
    authenticateToken,
    checkRolePermission(["super admin", "admin", "staff", "vendors"], "write"),
    updateProduct
  ) // update request
  .delete(
    authenticateToken,
    checkRolePermission(["super admin"], "write"),
    deleteProductByUUID
  ); // delete request

module.exports = router;
