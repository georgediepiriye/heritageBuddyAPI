const Notification = require("../models/notificationModel");
const Season = require("../models/seasonModel");
const User = require("../models/userModel");

//get all user notification
const getUserNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const season = await Season.find({ status: "ongoing" });

    const notifications = await Notification.find({
      user: user,
      season: season,
    }).sort({
      createdAt: -1,
    });

    if (notifications.length == 0) {
      return res
        .status(400)
        .json({ message: "No notifications in this season yet" });
    }
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(400).json(error);
  }
};
module.exports = { getUserNotifications };
