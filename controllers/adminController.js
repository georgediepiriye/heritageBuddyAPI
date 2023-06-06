const expressAsyncHandler = require("express-async-handler");
const Admin = require("../models/admin");

//create admin
const createAdmin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
   return res.status(400).json({ error: "Please enter all fields" });
    
  }

  const admin = new Admin({
    email: email,
    password: CryptoJS.AES.encrypt(
      password,
      process.env.PASS_SECRET
    ).toString(),
  });

  try {
    const newAdmin = await admin.save();

    if (newAdmin) {
     return res.status(201).json(newAdmin);
    } else {
     return res.status(400).json({ error: "somethig went wrong" });
      
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

module.exports = {
  createAdmin,
};
