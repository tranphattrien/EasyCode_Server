const bcrypt = require("bcrypt");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { getAuth } = require("firebase-admin/auth");
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
const sendMail = require("../utils/sendMail");
const generateUserName = async (email) => {
  let username = email.split("@")[0];
  const isUsernameExists = await User.exists({
    "personal_info.username": username
  });

  if (isUsernameExists) {
    username += uuidv4().substring(0, 5);
  }

  return username;
};

const fortmatDataToSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY,
    { expiresIn: "1h" }
  );
  return {
    access_token,
    _id: user._id,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname
  };
};
exports.postSignup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (fullname.length < 3) {
      return res
        .status(403)
        .json({ error: "Fullname must be at least 3 letters long !" });
    }

    if (!email.length) {
      return res.status(403).json({ error: "Enter Email" });
    }

    if (!emailRegex.test(email)) {
      return res.status(403).json({ error: "Invalid email address" });
    }

    if (!passwordRegex.test(password)) {
      return res.status(403).json({
        error:
          "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters!"
      });
    }

    const existingUser = await User.findOne({ email: email }).exec();

    if (existingUser) {
      return res.status(409).json({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const username = await generateUserName(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashedPassword,
        username,
        active: false
      }
    });

    const activation_token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_ACCESS_KEY,
      { expiresIn: "1d" }
    );

    const activationLink = `${process.env.CLIENT}/activation?token=${activation_token}`;

    await sendMail({
      email: email,
      subject: "Activate Your Account",
      message: `
        <p>Hello ${fullname} 👋, Please click following link to active your account ⬇️</p>
        <a href="${activationLink}">Verify Your Email</a>
    `
    });
    await user.save();
    return res.status(200).json({
      status:
        "Registration successful. Please check your email for activation link."
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email is already registered!" });
    }
    return res.status(500).json({ error: err.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { activation_token } = req.body;
    const decodedToken = jwt.verify(
      activation_token,
      process.env.SECRET_ACCESS_KEY
    );
    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.personal_info.active) {
      return res.status(400).json({ error: "Account already activated" });
    }

    user.personal_info.active = true;
    await user.save();

    return res.status(200).json({ message: "Account activated successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Activation token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Invalid activation token" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// exports.postSignup = async (req, res) => {
//   const { fullname, email, password } = req.body;

//   try {
//     if (fullname.length < 3) {
//       return res
//         .status(403)
//         .json({ error: "Fullname must be at least 3 letters long !" });
//     }

//     if (!email.length) {
//       return res.status(403).json({ error: "Enter Email" });
//     }

//     if (!emailRegex.test(email)) {
//       return res.status(403).json({ error: "Invalid email address" });
//     }

//     if (!passwordRegex.test(password)) {
//       return res.status(403).json({
//         error:
//           "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters!"
//       });
//     }
//     const existingUser = await User.findOne({ email: email }).exec();

//     if (existingUser) {
//       return res.status(409).json({ error: "Email is already registered" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 12);

//     const username = await generateUserName(email);

//     const user = new User({
//       personal_info: {
//         fullname,
//         email,
//         password: hashedPassword,
//         username
//       }
//     });

//     const savedUser = await user.save();

//     return res.status(200).json({
//       status: "Registration successful",
//       user: fortmatDataToSend(savedUser)
//     });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(409).json({ error: "Email is already registered!" });
//     }
//     return res.status(500).json({ error: err.message });
//   }
// };

exports.postSignin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "personal_info.email": email }).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.google_auth) {
      const isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      if (!user.personal_info.active) {
        return res.status(403).json({ error: "Account is not activated yet" });
      }

      return res.status(200).json({
        status: "Signin successful",
        user: fortmatDataToSend(user)
      });
    } else {
      return res.status(403).json({
        error: "Account was created using google. Try sign in with google!"
      });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.postGoogleAuth = async (req, res) => {
  const { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;
      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google. Please log in wit password to access the account!"
          });
        }
      } else {
        const username = await generateUserName(email);

        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username
          },
          google_auth: true
        });
        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
      return res.status(200).json({
        status: "Signin successful",
        user: fortmatDataToSend(user)
      });
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google. Try with some other google account!"
      });
    });
};

exports.changePassword = (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters!"
    });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res.status(403).json({
          error:
            "You can't change account's password because you logged in through google"
        });
      }
      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error:
                "Some error occured while changing the password, please try again later !"
            });
          }

          if (!result) {
            return res
              .status(403)
              .json({ error: "Incorrect current password !" });
          }
          bcrypt.hash(newPassword, 12, (err, hashed_password) => {
            User.findOneAndUpdate(
              { _id: req.user },
              { "personal_info.password": hashed_password }
            )
              .then((u) => {
                return res
                  .status(200)
                  .json({ status: "Password changed successful!" });
              })
              .catch((err) => {
                return res.status(500).json({
                  error:
                    "Some error occured while saving new password, Please try again later !"
                });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "User not found !" });
    });
};
