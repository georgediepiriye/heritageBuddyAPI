const router = require("express").Router();
const {
  sendMessage,
  getAllMessages,
  deleteAllMessages,
} = require("../controllers/messageController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create message
router.post("/", verifyToken, sendMessage);

//get all messages
router.get("/:chatId", verifyToken, getAllMessages);

//delete messages
router.delete("/:seasonId", verifyToken, deleteAllMessages);

module.exports = router;
