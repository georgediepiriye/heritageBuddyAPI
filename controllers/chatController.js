const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//get single chat
const getChat = async (req, res) => {
  try {
    const team = req.params.id;
    const chat = await Chat.findOne({ team: team }).populate({
      path: "users",
    });

    if (!chat) {
      return res.status(400).json({ error: "No chat with that id found" });
    }

    return res.status(200).json(chat);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  getChat,
};
