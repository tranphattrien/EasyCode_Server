const express = require("express");

const authController = require("../controllers/auth");
const { verifyJWT } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", authController.postSignup);
router.post("/activation", authController.activateAccount);

router.post("/signin", authController.postSignin);

router.post("/google-auth", authController.postGoogleAuth);

router.post("/change-password", verifyJWT, authController.changePassword);

module.exports = router;
