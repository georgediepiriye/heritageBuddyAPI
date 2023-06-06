const router = require("express").Router();
const {
  createEventMessage,
  getAllEventMessages,
  deleteEventMessage,
} = require("../controllers/eventMessageController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("./verifyToken");

//create event message
router.post("/:id", verifyToken, createEventMessage);

//get all eventMessages
router.put("/:id", verifyToken, getAllEventMessages);

//delete eventMessage
router.delete("/:id", verifyToken, deleteEventMessage);

module.exports = router;
