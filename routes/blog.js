const express = require("express");

const blogController = require("../controllers/blog");
const { upload } = require("../multer");
const { verifyJWT } = require("../middlewares/auth");
const router = express.Router();

router.post("/upload", upload, blogController.postUploadImage);

router.post("/create-blog", verifyJWT, blogController.postCreateBlog);

router.post("/latest-blogs", blogController.postLatestBlogs);

router.get("/trending-blogs", blogController.getTrendingBlogs);

router.post("/search-blogs", blogController.postSearchBlog);

router.post("/all-latest-blogs-count", blogController.postAllLatestBlogsCount);

router.post("/search-blogs-count", blogController.postCategoryBlogsCount);

router.post("/get-blog", blogController.postGetBlog);
router.post("/like-blog", verifyJWT, blogController.postLikeBlog);

router.post("/isliked-by-user", verifyJWT, blogController.postIsLikedByUser);
router.post("/add-comment", verifyJWT, blogController.postAddComment);
router.post("/get-blog-comments", blogController.getBlogComment);
router.post("/get-replies", blogController.getReplies);
router.post("/delete-comment", verifyJWT, blogController.deleteComment);
module.exports = router;
