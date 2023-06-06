const FirebaseToken = require("../models/tokenModel");
const User = require("../models/userModel");

//send firebase token
const sendFirebaseToken = async (req, res) => {
  const token = req.body.token;

  try {
    const user = await User.findById(req.body.user);
    const firebaseToken = await FirebaseToken.findOne({ user: user });
    if (user) {
      if (!firebaseToken) {
        const newToken = new FirebaseToken({
          token: token,
          user: user,
        });
        
        const savedToken = await newToken.save();
        if (savedToken) {
         return res
           .status(200)
           .json({ message: "Firebase token sent successfully!" });
        } else {
         return res.status(400).json({ error: "Something went wrong!" });
        }
      } else {
        if (firebaseToken.token == token) {
         return res
           .status(200)
           .json({ message: "Firebase token exists and sent successfully!" });
        } else {
          const updatedToken = await FirebaseToken.updateOne(firebaseToken, {
            token: token,
          });

          if (updatedToken) {
           return res.status(200).json({
             message: "Firebase token updated and sent successfully!",
           });
          } else {
           return res.status(400).json({ error: "Something went wrong!" });
          }
        }
      }
    } else {
     return res.status(400).json({ error: "No user with that id found" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendFirebaseToken };
