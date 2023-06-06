const expressAsyncHandler = require("express-async-handler");
const AdminMessage = require("../models/adminMessageModel");
const Season = require("../models/seasonModel");
const User = require("../models/userModel");

//create admin Message
const createAdminMessage = expressAsyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
   return res.status(400).json({ error: "Please enter all fields" });
   
  }

  const user = await User.findOne({ email: email });
  const season = await Season.findOne({ status: "ongoing" });
  if (!user) {
   return res.status(400).json({ error: "Please enter email of valid user" });
    
  }

  const adminMessage = new AdminMessage({
    name: name,
    email: email,
    message: message,
    season: season,
    user: user,
  });

  try {
    const savedAdminMessage = await adminMessage.save();

    if (savedAdminMessage) {
     return res.status(201).json({
       status: "message sent successfully",
       adminMessage: savedAdminMessage,
     });
    } else {
     return res.status(400).json("Failed to send message,try again");
      
    }
  } catch (err) {
  return  res.status(400).json(err);
  }
});

//get all adminMessages
const getAllAdminMessages = expressAsyncHandler(async (req, res) => {
  try {
    const adminMessages = await AdminMessage.find().populate("user");
    if (adminMessages.length == 0) {
     return res.status(400).json({ error: "There are no admin messages" });
    
    } else {
     return res.status(200).json(adminMessages);
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//delete adminMessage
const deleteAdminMessage = expressAsyncHandler(async (req, res) => {
  try {
    await AdminMessage.findByIdAndDelete(req.params.id);
   return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
   return res.status(500).json(err);
  }
});

module.exports = {
  createAdminMessage,
  getAllAdminMessages,
  deleteAdminMessage,
};
