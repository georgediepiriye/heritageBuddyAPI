const router = require("express").Router();
const {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  getPendingTasks,
  getCompletedTasks,
  deleteTask,
} = require("../controllers/taskController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create task
router.post("/", createTask);

//get all tasks
router.get("/season/:id", verifyToken, getAllTasks);

//get single task
router.get("/:id", verifyToken, getTask);

//get pending tasks
router.get("/pending/:id", verifyToken, getPendingTasks);

//get completed tasks
router.get("/completed/:id", verifyToken, getCompletedTasks);

//update task
router.put("/:id", updateTask);

//delete task
router.delete("/:id", deleteTask);

module.exports = router;
