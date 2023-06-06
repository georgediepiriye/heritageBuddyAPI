const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
  {
    description: { type: String },
    optionA: { type: String },
    optionB: { type: String },
    optionC: { type: String },
    optionD: { type: String },

    answer: { type: String },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
