const mongoose = require("mongoose");

const birthdaySchema = mongoose.Schema(
  {
    date: { type: String },
    user: { type: Object },
  },
  { timestamps: true }
);

const Birthday = mongoose.model("Birthday", birthdaySchema);
module.exports = Birthday;
