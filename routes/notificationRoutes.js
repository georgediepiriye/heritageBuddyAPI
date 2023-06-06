const router = require("express").Router();
const {
  getUserNotifications,
} = require("../controllers/notificationController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("./verifyToken");

//get all user notifications
router.get("/:id", verifyToken, getUserNotifications);

module.exports = router;
