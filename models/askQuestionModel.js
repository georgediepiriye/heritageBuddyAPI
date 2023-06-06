const mongoose = require("mongoose");

const askQuestionSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    email: { type: String, require: true },
    question: { type: String, require: true },
  },
  { timestamps: true }
);

const AskQuestion = mongoose.model("AskQuestion", askQuestionSchema);
module.exports = AskQuestion;
