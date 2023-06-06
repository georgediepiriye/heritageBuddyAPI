const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    time: { type: Date },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
