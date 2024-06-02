const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const admin = require("firebase-admin");
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blog");
const userRoutes = require("./routes/user");
const serviceAccountKey = require("./serviceAccountKey.json");

const server = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

server.use(express.json());
server.use(cors());

mongoose
  .connect(process.env.DB_LOCATION, {
    autoIndex: true
  })
  .then((result) => {
    console.log("Connected database");
    server.listen(process.env.SERVER_PORT, () => {
      console.log(`Server running on port ${process.env.SERVER_PORT}`);
    });
  })
  .catch((err) => console.log(err));

server.use(authRoutes);
server.use(blogRoutes);
server.use(userRoutes);
