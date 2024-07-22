const express = require("express");

const userController = require("../controllers/user");
const { verifyJWT } = require("../middlewares/auth");

const router = express.Router();

router.post("/search-users", userController.postSearchUser);

router.post("/get-profile", userController.postGetProfile);

router.post("/update-profile-img", verifyJWT, userController.updateProfileImg);
router.post("/update-profile", verifyJWT, userController.updateProfile);

module.exports = router;
