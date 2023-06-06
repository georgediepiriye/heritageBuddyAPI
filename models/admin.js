const mongoose = require("mongoose");

const admin = mongoose.Schema(
  {
    email: { type: String },
    password: { type: String },
    isMainAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", admin);
module.exports = Admin;
