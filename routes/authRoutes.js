const User = require("../models/userModel");

const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const request = require("request");

//register admin
router.post("/register-admin", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Enter all fields" });
  }
  const newAdmin = new Admin({
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString(),
  });
  try {
    const adminExist = await Admin.findOne({
      email: req.params.email,
      phone: req.params.phone,
    });

    if (adminExist) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }
    const savedAdmin = await newAdmin.save();
    const { password, ...others } = savedAdmin._doc;

    return res.status(200).json(others);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//register
router.post("/register", async (req, res) => {
  const newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString(),
    gender: req.body.gender,
    dob: null,
    age: null,
    pic: req.body.pic,
    departments: null,
    ministries: null,
    isMainAdmin: req.body.isMainAdmin,
    isSubAdmin: req.body.isSubAdmin,
    registrationComplete: req.body.registrationComplete,
    isPaired: false,
  });
  try {
    const userExist = await User.findOne({
      email: req.params.email,
      phone: req.params.phone,
    });

    if (userExist) {
      return res
        .status(400)
        .json({ error: "User with this email or phone number already exists" });
    }
    const savedUser = await newUser.save();
    const { password, ...others } = savedUser._doc;

    return res.status(200).json(others);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        error: "wrong credentials",
      });
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECRET
    );

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({
        error: "wrong credentials",
      });
    }

    if (!user.registrationComplete) {
      return res.status(401).json({
        error: "Please kindly complete your registration!",
      });
    }
    if (user.isSuspended) {
      return res.status(401).json({
        error: "Your account is currently suspended!",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isMainAdmin: user.isMainAdmin,
        isSubAdmin: user.isSubAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "10d" }
    );

    const { password, ...others } = user._doc;

    return res.status(200).json({ ...others, accessToken });
  } catch (err) {
    return res.status(500).json(err);
  }
});

// dashboard-login
router.post("/dashboard-login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const admin = await Admin.findOne({ email: req.body.email });
    if (!user && !admin) {
      return res.status(400).json({
        error: "wrong credentials",
      });
    }

    if (user) {
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.PASS_SECRET
      );

      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      if (originalPassword !== req.body.password) {
        return res.status(400).json({
          error: "wrong credentials",
        });
      }
      if (user.isSuspended) {
        return res.status(400).json({
          error: "Your account is currently suspended!",
        });
      }
      if (!user.isSubAdmin) {
       return res.status(401).json({
         error: "You are not authorized, you are not an admin or a ranger!",
       });
        
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          isMainAdmin: user.isMainAdmin,
          isSubAdmin: user.isSubAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "1d" }
      );

      const { password, ...others } = user._doc;

    return res.status(200).json({ ...others, accessToken });
      
    }

    if (admin) {
      const hashedPassword = CryptoJS.AES.decrypt(
        admin.password,
        process.env.PASS_SECRET
      );

      const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
      if (originalPassword !== req.body.password) {
       return res.status(401).json({
         error: "wrong credentials",
       });
        
      }

      const accessToken = jwt.sign(
        {
          id: admin._id,
        },
        process.env.JWT_SEC,
        { expiresIn: "4d" }
      );

      const { password, ...others } = admin._doc;

    return res.status(200).json({ ...others, accessToken });
     
    }
  } catch (err) {
   return res.status(500).json(err);
  }
});

//forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
   return res
     .status(400)
     .json({ error: "No user with this email found in our records" });
   
  }
  const secret = process.env.JWT_SEC + user.password;
  const payload = {
    email: user.email,
    _id: user._id,
  };

  const token = jwt.sign(payload, secret, { expiresIn: "15m" });
  const link = `https://heritage-buddy.herokuapp.com/api/v1/auth/reset-password/${user._id}/${token}`;

  try {
    var options = {
      method: "POST",
      url: "https://api.sendchamp.com/api/v1/email/send",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEND_CHAMP_TOKEN}`,
      },
      body: JSON.stringify({
        from: {
          email: "heritagebuddyz@gmail.com",
          name: "Heritage Buddy",
        },
        to: [{ email: email, name: user.firstname }],
        message_body: {
          value: `Hello, here is your password reset link ${link}`,
          type: "text/html",
        },
        subject: "Password reset link",
      }),
    };

    request(options, function (err, response) {
      if (response.status === "failed") {
       return res
         .status(400)
         .json({ error: "Something went wrong,please try again" });
       
      } else {
       return res.status(200).send({
         message: "Password reset link has been sent to your email..",
       });

       
      }
    });
  } catch (error) {
   return res.status(400).json(error);
  }
});

//get reset link
router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await User.findById(id);
  if (!user) {
  return res.status(400).json({ error: "Invalid user id" });
    
  }

  const secret = process.env.JWT_SEC + user.password;
  try {
    const payload = jwt.verify(token, secret);
   return res.render("reset-password", { email: user.email });
  } catch (error) {
   return res.status(500).json(error);
    
  }
});

//change password
router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  const user = await User.findById(id);
  if (!user) {
   return res.status(400).render("invalid-user");
  
  }

  const secret = process.env.JWT_SEC + user.password;
  try {
    const payload = jwt.verify(token, secret);
    if (password !== password2) {
     return res.status(400).render("incorrect-passwords");
      
    }
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: {
        password: CryptoJS.AES.encrypt(
          password,
          process.env.PASS_SECRET
        ).toString(),
      },
    });
    res.status(200).render("password-success");
    res.render("reset-password", { email: user.email });
  } catch (error) {
   return res.status(500).json(error);
   
  }
});
module.exports = router;
