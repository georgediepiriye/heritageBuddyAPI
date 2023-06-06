const router = require("express").Router();
const { createQuestion } = require("../controllers/questionController");

//create question
router.post("/", createQuestion);

module.exports = router;
