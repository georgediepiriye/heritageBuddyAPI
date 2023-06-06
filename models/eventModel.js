const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    image: { type: String },
    title: { type: String },
    date: { type: String },
    type: { type: String, default: "general" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
