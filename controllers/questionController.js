const Question = require("../models/questionModel");

const createQuestion = async (req, res) => {
  try {
    const { description, optionA, optionB, optionC, optionD, answer } =
      req.body;

    const question = await Question.create({
      description,
      optionA,
      optionB,
      optionC,
      optionD,
      answer,
    });

    return res.status(201).json(question);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { createQuestion };
