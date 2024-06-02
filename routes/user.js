const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/search-users", userController.postSearchUser);

module.exports = router;
