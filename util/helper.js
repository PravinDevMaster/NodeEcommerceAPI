const bcrypt = require("bcryptjs");

// const generateVendorId = async (email) => {
//   const salt = await bcrypt.genSalt(10); // Generate a salt
//   const hash = await bcrypt.hash(email, salt); // Hash the email with the salt
//   const shortHash = hash.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8)
//   return `vendor_${shortHash}`;
// };

// function to generate the product unique url based on the project name
const generateUniqueUrl = (productName) => {
  const formattedName = productName
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .trim("-");

  const randomId = Math.random().toString(36).substring(2, 10); // Random alphanumeric string
  return `${formattedName}-${randomId}`;
};

module.exports = { generateUniqueUrl };
