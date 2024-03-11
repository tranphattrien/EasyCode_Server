const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.post("/signup", authController.postSignup);

router.post("/signin", authController.postSignin);

module.exports = router;
