const mongoose = require("mongoose");

const submittedTaskSchema = mongoose.Schema(
  {
    desc: { type: String, default: null },
    image: { type: String, default: null },
    video: { type: String, default: null },
    answers: [{ type: String, default: null }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    season: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Season",
      require: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      require: true,
    },
    isGraded: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
    isObjective: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const SubmittedTask = mongoose.model("SubmitTask", submittedTaskSchema);
module.exports = SubmittedTask;
