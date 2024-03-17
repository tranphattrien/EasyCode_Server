const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EasyCode-Blogging",
    allowed_formats: ["jpg", "jpeg", "png"],
    // transformation: [{ width: 500, height: 500, crop: "limit" }]
    transformation: [{ width: "auto", quality: "auto", fetch_format: "auto" }]
  }
});

const upload = multer({ storage: storage }).single("image");

module.exports = {
  upload,
  cloudinary
};
