const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    points: { type: Number, require: true },
    title: { type: String, default: null },
    desc: { type: String, default: null },
    startDate: { type: Date, require: true },
    deadline: { type: Date, require: true },
    status: { type: String, default: "pending" },
    type: { type: String, require: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      require: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
