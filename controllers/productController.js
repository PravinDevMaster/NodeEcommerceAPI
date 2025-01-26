const Product = require("../models/Products");
const Role = require("../models/Role");
const User = require("../models/User");
const { generateUniqueUrl } = require("../util/helper");

// create product
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      vendorId,
      scheduledStartDate,
      delivery,
      images,
      price,
      createdBy,
    } = req.body;
    // Validate that all required fields are provided
    if (!name || !category || !vendorId || !scheduledStartDate || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const loggedInUserId = req.user.userId; // logged-in user's uuid is in req.user.uuid
    // Check if the vendor exists in the User collection
    const existingVendor = await User.findOne({ uuid: vendorId });
    if (!existingVendor) {
      return res
        .status(404)
        .json({ message: `Vendor with UUID ${vendorId} not found.` });
    }

    // Get the logged-in user's role and details
    const loginUser = await User.findOne({ uuid: loggedInUserId });
    const loggedInUserRole = await Role.findOne({ uuid: req.user.role }); // logged-in user's role uuid is in req.user.role
    if (!loginUser) {
      return res.status(404).json({ message: "Logged-in user not found." });
    }

    // If the logged-in user's role is staff, check their `vendors` array
    if (loggedInUserRole.name === "staff") {
      if (!loginUser.vendors || !loginUser.vendors.includes(vendorId)) {
        return res.status(403).json({
          message: `You are not authorized to perform this action. Vendor with UUID ${vendorId} is not included in your versions.`,
        });
      }
    }

    // Parse scheduledStartDate to Date
    const startDate = new Date(scheduledStartDate);
    // Add 7 days to the scheduledStartDate to calculate expiryDate
    const expiryDate = new Date(startDate);
    expiryDate.setDate(startDate.getDate() + 7);

    // generate product url
    const productURL = generateUniqueUrl(name);

    // Create the new product
    const newProduct = new Product({
      name,
      description,
      category,
      vendorId,
      createdBy,
      scheduledStartDate,
      expiryDate, // Use the calculated expiry date
      delivery,
      images,
      productURL: `product-${Date.now()}`,
      price,
      createdBy: loggedInUserRole.name === "staff" ? vendorId : loggedInUserId,
    });

    // Save the product to the database
    await newProduct.save();

    return res.status(201).json(newProduct);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

// update product
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      vendorId,
      scheduledStartDate,
      delivery,
      images,
      price,
    } = req.body;
    if (vendorId) {
      // Check if the vendor exists in the User collection
      const existingVendor = await User.findOne({ uuid: vendorId });
      if (!existingVendor) {
        return res
          .status(404)
          .json({ message: `Vendor with UUID ${vendorId} not found.` });
      }
    }

    // Find the existing product
    const product = await Product.findOne({ uuid: req.params.uuid });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if the project name is provided and different for existing only update the product url
    if (product.name !== name && name) {
      const productURL = generateUniqueUrl(name);
      product.productURL = productURL;
    }
    // Update fields only if they are provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.vendorId = vendorId || product.vendorId;
    product.delivery = delivery || product.delivery;
    product.images = images || product.images;
    product.price = price || product.price;

    // If the scheduledStartDate is provided, update only the expiryDate
    if (scheduledStartDate) {
      const startDate = new Date(scheduledStartDate);
      // Update the expiryDate (7 days after the scheduledStartDate)
      const expiryDate = new Date(startDate);
      expiryDate.setDate(startDate.getDate() + 7);

      // Update the expiryDate field in the product
      product.scheduledStartDate = startDate;
      product.expiryDate = expiryDate; // Only update the expiryDate

      // Save the updated product
      await product.save();

      return res.status(200).json(product);
    }
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};

//   get product by uuid
const getProductByUUId = async (req, res, next) => {
  try {
    const productByUuid = await Product.findOne({ uuid: req.params.uuid });
    // check the product is exists.
    if (!productByUuid) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(productByUuid);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};
//   get all products
const getAllProducts = async (req, res, next) => {
  try {
    // Get the logged-in user's role
    const loginUserRole = await Role.findOne({ uuid: req.user.role });

    // Check if the logged-in user is a vendor
    if (loginUserRole.name === "vendors") {
      // If vendor, filter products by 'createdBy' field matching the logged-in user's ID
      const products = await Product.find({ createdBy: req.user.userId });
      return res.status(200).json(products);
    }

    // If not a vendor, return all products
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};
//   delete product by uuid
const deleteProductByUUID = async (req, res, next) => {
  try {
    const deleteProduct = await Product.findOneAndDelete({
      uuid: req.params.uuid,
    });
    // check the product is exists.
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error); // pass the error to the error handler
  }
};
// export above controllers
module.exports = {
  createProduct,
  updateProduct,
  getProductByUUId,
  getAllProducts,
  deleteProductByUUID,
};
