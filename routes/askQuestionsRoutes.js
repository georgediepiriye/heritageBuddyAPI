const router = require("express").Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestion,
  deleteQuestion,
} = require("../controllers/askQuestionController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create question
router.post("/", verifyToken, createQuestion);

//get all questions
router.get("/", verifyToken, getAllQuestions);

//get single question
router.get("/:id", verifyToken, getQuestion);

//delete question
router.delete("/:id", deleteQuestion);

module.exports = router;
