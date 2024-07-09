const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/search-users", userController.postSearchUser);

router.post("/get-profile", userController.postGetProfile);


module.exports = router;
