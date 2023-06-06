const User = require("../models/userModel");
const Buddies = require("../models/buddiesModel");
const CryptoJS = require("crypto-js");

const { verifyToken, verifyTokenAndAuthorization } = require("./verifyToken");
const cloudinary = require("../utils/cloudinary");
const Birthday = require("../models/birthdayModel");
const Notification = require("../models/notificationModel");
const Season = require("../models/seasonModel");

const router = require("express").Router();

//update user
router.put(
  "/:id",
  verifyToken,
  verifyTokenAndAuthorization,
  async (req, res) => {
    try {
      const oldUser = await User.findById(req.params.id);
      let firstname = " ";
      let lastname = " ";
      let phone = 0;
      let email = " ";
      let pic = " ";
      let departments = [];
      let ministries = [];

      if (req.body.firstname) {
        firstname = req.body.firstname;
      } else {
        firstname = oldUser.firstname;
      }
      if (req.body.lastname) {
        lastname = req.body.lastname;
      } else {
        lastname = oldUser.lastname;
      }
      if (req.body.phone) {
        phone = req.body.phone;
      } else {
        phone = oldUser.phone;
      }

      if (req.body.email) {
        email = req.body.email;
      } else {
        email = oldUser.email;
      }

      if (req.body.departments) {
        departments = req.body.departments;
      } else {
        departments = oldUser.departments;
      }
      if (req.body.ministries) {
        ministries = req.body.ministries;
      } else {
        ministries = oldUser.ministries;
      }

      if (req.files) {
        const imageFile = req.files.pic;
        const imageResult = await cloudinary.uploader.upload(
          imageFile.tempFilePath,
          (err, imageResult) => {}
        );
        pic = imageResult.url;
      } else {
        pic = oldUser.pic;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            firstname: firstname,
            lastname: lastname,
            phone: phone,
            email: email,
            pic: pic,
            departments: departments,
            ministries: ministries,
          },
        },
        { new: true }
      );

      if (updatedUser) {
        //get current season
        const season = await Season.findOne({ status: "ongoing" });

        //get the team current user belongs to in ongoing season
        const team = await Buddies.findOne({
          season: season,
          "users.email": updatedUser.email,
        });

        const users = team.users;

        users.map(async (user) => {
          if (user.email === updatedUser.email) {
            const newUser = {
              firstname: updatedUser.firstname,
              lastname: updatedUser.lastname,
              pic: updatedUser.pic,
              phone: updatedUser.phone,
              departments: updatedUser.departments,
              ministries: updatedUser.ministries,
            };

            const buddies = await Buddies.findOneAndUpdate(
              { "users.email": user.email, season: season },
              {
                $set: { "users.$": updatedUser },
              },
              { new: true }
            );
          }
        });
        res.status(200).json({
          message: "Profile updated successfully!",
          updatedUser: updatedUser,
        });
      } else {
        res.status(400).json({
          error: "Something went wrong,please try again",
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//change password
router.put("/change_password/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const confirmPassword = req.body.confirmPassword;
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    if (!confirmPassword || !newPassword || !oldPassword) {
      res.status(400).json({ error: "Please enter all fields" });
      return;
    }

    if (newPassword != confirmPassword) {
      res.status(400).json({
        error: "Your new password and confirm password doesn't match",
      });
      return;
    }
    const decryptedOldPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECRET
    );
    const mainDecryptedPassword = decryptedOldPassword.toString(
      CryptoJS.enc.Utf8
    );
    console.log(mainDecryptedPassword);
    if (oldPassword != mainDecryptedPassword) {
      res.status(400).json({
        error: "Your password isn't correct",
      });
      return;
    }
    const mainNewPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_SECRET
    ).toString();

    await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          password: mainNewPassword,
        },
      },
      { new: true }
    );
    res.status(200).json({
      message: "Password changed successfully!",
    });
  } catch (error) {
    res.status(400).json(error);
  }
});
//delete user
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get single user
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const user = await (
      await User.findById(req.params.id).populate("departments")
    ).populate("ministries");

    const unlockedMilestoneCount = await Buddies.find({
      "users.email": user.email,
      unlockedMilestone: true,
    });

    const unlockedMilestone = unlockedMilestoneCount.length;
    const { password, ...others } = user._doc;
    res.status(200).json({
      user: others,
      unlockedMilestone: unlockedMilestone,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get single user admin
router.get("/admin/find/:id", async (req, res) => {
  try {
    const user = await (
      await User.findById(req.params.id).populate("departments")
    ).populate("ministries");

    const unlockedMilestoneCount = await Buddies.find({
      "users.email": user.email,
      unlockedMilestone: true,
    });

    const unlockedMilestone = unlockedMilestoneCount.length;
    const { password, ...others } = user._doc;
    res.status(200).json({
      user: others,
      unlockedMilestone: unlockedMilestone,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get top performing users
router.get("/ranks", async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(5);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all unpaired users
router.get("/unpaired", async (req, res) => {
  try {
    const users = await User.find({
      isPaired: false,
      isMainAdmin: false,
    })
      .populate("departments")
      .populate("ministries")
      .sort({ firstname: 1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

//get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .populate("departments")
      .populate("ministries")
      .sort({ firstname: 1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});
//make user a ranger
router.put("/make-ranger/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isSubAdmin: true,
        },
      },
      { new: true }
    );
    const season = await Season.findOne({ status: "ongoing" });
    const today = new Date(Date.now());
    const date = today.toISOString();
    const notification = new Notification({
      user: user,
      message: `Congratulations, you've been made a ranger for this season.`,
      time: date,
      season: season,
    });
    await notification.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});
//remove user as ranger
router.put("/remove-ranger/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isSubAdmin: false,
        },
      },
      { new: true }
    );

    const season = await Season.findOne({ status: "ongoing" });
    const today = new Date(Date.now());
    const date = today.toISOString();
    const notification = new Notification({
      user: user,
      message: `Hello..You are no longer a ranger in this season.`,
      time: date,
      season: season,
    });
    await notification.save();

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//suspend user
router.put("/suspend/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isSuspended: true,
        },
      },
      { new: true }
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//reverse user suspension
router.put("/unsuspend/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isSuspended: false,
        },
      },
      { new: true }
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user age
const getAge = async (req, res, next) => {
  var today = new Date();
  var birthDate = new Date(req.body.dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  req.body.age = age;
  next();
};

//user complete registration
router.post("/reg_complete/:id", getAge, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          gender: req.body.gender,
          dob: req.body.dob,
          age: req.body.age,
          departments: req.body.departments,
          ministries: req.body.ministries,
          registrationComplete: "true",
        },
      },
      { new: true }
    )
      .populate("ministries")
      .populate("departments");

    if (!updated) {
      res.status(400).json("Registration not yet complete");
      return;
    }
    const day = updated.dob.getDate();
    const month = updated.dob.getMonth() + 1;
    const date = `${day}/${month}`;
    const birthdayUser = {
      _id: updated._id,
      firstname: updated.firstname,
      pic: updated.pic,
    };
    const birthday = new Birthday({
      date: date,
      user: birthdayUser,
    });
    await birthday.save();
    res.status(200).json({
      message: "User registration complete",
      user: updated,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
