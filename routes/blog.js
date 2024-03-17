const express = require("express");

const blogController = require("../controllers/blog");
const { upload } = require("../multer");

const router = express.Router();

router.post("/upload", upload, blogController.postUploadImage);

module.exports = router;
