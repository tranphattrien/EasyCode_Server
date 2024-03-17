const { cloudinary } = require("../multer");

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
