const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.postSignup);
router.post("/activation", authController.activateAccount);

router.post("/signin", authController.postSignin);

router.post("/google-auth", authController.postGoogleAuth);

module.exports = router;
