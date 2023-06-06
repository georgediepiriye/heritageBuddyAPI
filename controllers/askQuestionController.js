const expressAsyncHandler = require("express-async-handler");
const AskQuestion = require("../models/askQuestionModel");

//create question
const createQuestion = expressAsyncHandler(async (req, res) => {
  const { name, email, question } = req.body;
  if (!name || !email || !question) {
    return res.status(400).json("Please enter Department name");
  }

  const askQuestion = new AskQuestion({
    name: name,
    email: email,
    question: question,
  });

  try {
    const savedQuestion = await askQuestion.save();

    if (savedQuestion) {
      return res.status(201).json(savedQuestion);
    } else {
      return res.status(400).json("Failed to create question");
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all askQuestions
const getAllQuestions = expressAsyncHandler(async (req, res) => {
  try {
    const askQuestions = await AskQuestion.find();
    if (askQuestions.length == 0) {
      return res.status(400).json({ error: "No questions yet" });
    } else {
      return res.status(200).json(askQuestions);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get single question
const getQuestion = expressAsyncHandler(async (req, res) => {
  try {
    const question = await AskQuestion.findById(req.params.id);
    if (!question) {
      return res.status(400).json("No question with that id found");
    } else {
      return res.status(200).json(question);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//delete question
const deleteQuestion = expressAsyncHandler(async (req, res) => {
  try {
    await AskQuestion.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = {
  createQuestion,
  getQuestion,
  getAllQuestions,
  deleteQuestion,
};
