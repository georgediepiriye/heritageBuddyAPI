const mongoose = require("mongoose");

const seasonSchema = mongoose.Schema(
  {
    startDate: { type: Date, require: true },
    endDate: { type: Date, require: true },
    milestone: { type: Number, require: true },
    reward: { type: String, require: true },
    tasks: [{ type: Object }],
    totalTasks: { type: Number, default: 0 },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Season = mongoose.model("Season", seasonSchema);
module.exports = Season;
