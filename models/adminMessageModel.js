const mongoose = require("mongoose");

const adminMessageSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    message: { type: String },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const AdminMessage = mongoose.model("AdminMessage", adminMessageSchema);
module.exports = AdminMessage;
