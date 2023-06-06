const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const buddiesSchema = mongoose.Schema(
  {
    groupName: { type: String, require: true },
    users: [{ type: Object }],
    points: { type: Number, default: 0 },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      require: true,
    },
    unlockedMilestone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
buddiesSchema.plugin(uniqueValidator);

const Buddies = mongoose.model("Buddies", buddiesSchema);
module.exports = Buddies;
