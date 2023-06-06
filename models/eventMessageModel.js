const mongoose = require("mongoose");

const eventMessageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String, require: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
    status: { type: String, default: "unread" },
  },
  { timestamps: true }
);

const EventMessage = mongoose.model("EventMessage", eventMessageSchema);
module.exports = EventMessage;
