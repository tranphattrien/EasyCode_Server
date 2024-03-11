const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");

let PORT = 3000;

const server = express();
server.use(express.json());

mongoose
  .connect(process.env.DB_LOCATION, {
    autoIndex: true
  })
  .then((result) => {
    console.log("Connected database");
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

server.use(authRoutes);
