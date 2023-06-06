const router = require("express").Router();
const { getChat } = require("../controllers/chatController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//get single chat
router.get("/:id", verifyToken, getChat);

module.exports = router;
