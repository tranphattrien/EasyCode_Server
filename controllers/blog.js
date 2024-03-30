const { cloudinary } = require("../multer");
const { v4: uuidv4 } = require("uuid");
const Blog = require("../models/blog");
const User = require("../models/user");

exports.postUploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  // Upload image to Cloudinary
  cloudinary.uploader.upload(
    req.file.path,
    { folder: "EasyCode-Blogging" },
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: "Failed to upload image to Cloudinary",
          error: error
        });
      }
      const imageUrl = result.secure_url;
      res.json({ imageUrl: imageUrl });
    }
  );
};

exports.postCreateBlog = (req, res) => {
  const authorId = req.user;
  let { title, des, banner, tags, content, draft } = req.body;

  if (!title || !title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title for the blog !" });
  }

  if (!draft) {
    if (!des || !des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters !"
      });
    }

    if (!banner || !banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it !" });
    }

    if (!content || !content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog content to publish it !" });
    }

    if (!tags || !tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, maximun 10 !"
      });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blog_id =
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + uuidv4().substring(0, 5);

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    blog_id,
    draft: Boolean(draft)
  });
  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;

      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id }
        }
      )
        .then((user) => {
          return res.status(200).json({
            status: "Publish blog successfully !",
            id: blog.blog_id,
            blog: blog
          });
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ error: "Failed to update total posts number !" });
        });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

exports.getLatestBlogs = (req, res) => {
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

exports.getTrendingBlogs = (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_read": -1,
      "activity.total_likes": -1,
      publishedAt: -1
    })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};

exports.postSearchBlog = (req, res) => {
  const { tag } = req.body;
  const findQuery = { tags: tag, draft: false };

  const maxLimit = 5;

  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((error) => {
      return res.status(500).json({ error: error.message });
    });
};
