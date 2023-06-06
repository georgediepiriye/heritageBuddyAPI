const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema(
  {
    token: { type: String, require: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);

const FirebaseToken = mongoose.model("FirebaseToken", tokenSchema);
module.exports = FirebaseToken;
