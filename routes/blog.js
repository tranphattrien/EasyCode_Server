const express = require("express");

const blogController = require("../controllers/blog");
const { upload } = require("../multer");
const { verifyJWT } = require("../middlewares/auth");
const router = express.Router();

router.post("/upload", upload, blogController.postUploadImage);

router.post("/create-blog", verifyJWT, blogController.postCreateBlog);

router.get("/latest-blogs",blogController.getLastestBlogs )

module.exports = router;
