const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Season = require("../models/seasonModel");
const User = require("../models/userModel");

//create message
const sendMessage = async (req, res) => {
  const { chat, sender, content } = req.body;
  if (!chat || !sender || !content) {
    return res.status(400).json("Please enter all fields");
  }

  const message = new Message({
    sender: sender,
    chat: chat,
    content: content,
    season: chat.season,
  });
  try {
    var savedMessage = await message.save();
    savedMessage = await savedMessage.populate(
      "sender",
      "firstname lastname pic"
    );

    return res.status(200).json(savedMessage);
  } catch (error) {
    return res.status(500).json(error);
  }
};

//get all messages for a chat
const getAllMessages = async (req, res) => {
  const chat = req.params.chatId;
  try {
    const messages = await Message.find({ chat: chat }).populate(
      "sender",
      "firstname lastname pic"
    );
    if (messages.length === 0) {
      return res.status(400).json({ error: "No messages in this group" });
    }
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json(error);
  }
};

//delete all messages in a season
const deleteAllMessages = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findById(req.params.seasonId);
    const messages = await Message.find({
      season: season,
      createAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    });
    if (messages.length > 0) {
      const messagesDeleted = await Message.deleteMany({
        season: season,
        createAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      });
      if (messagesDeleted) {
        return res.status(200).json("Messages deleted successfully!");
      } else {
        return res.status(400).json("Messages weren't deleted");
      }
    } else {
      return res.status(200).json("No message to delete");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = {
  sendMessage,
  getAllMessages,
  deleteAllMessages,
};
