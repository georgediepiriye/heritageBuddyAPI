const mongoose = require("mongoose");

const ministrySchema = mongoose.Schema(
  {
    name: { type: String, require: true, unique: true },
  },
  { timestamps: true }
);

const Ministry = mongoose.model("Ministry", ministrySchema);
module.exports = Ministry;
