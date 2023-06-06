const router = require("express").Router();
const {
  createAdminMessage,
  getAllAdminMessages,
  deleteAdminMessage,
} = require("../controllers/adminMessageController");
const { verifyToken } = require("./verifyToken");

//create admin message
router.post("/", verifyToken, createAdminMessage);

//get all admin messages
router.get("/", verifyToken, getAllAdminMessages);

//delete admin messages
router.delete("/:id", verifyToken, deleteAdminMessage);

module.exports = router;
