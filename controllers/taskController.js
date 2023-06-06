const expressAsyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const Season = require("../models/seasonModel");
const Question = require("../models/questionModel");
const User = require("../models/userModel");
const agenda = require("../jobs/agenda");
const { sendNotification } = require("../utils/sendNotification");

//create task
const createTask = expressAsyncHandler(async (req, res) => {
  const { points, startDate, deadline } = req.body;
  if (!points || !startDate || !deadline) {
    return res.status(400).json("Please enter all fields");
  }

  const task = new Task({
    points: req.body.points,
    title: req.body.title,
    desc: req.body.desc,
    startDate: req.body.startDate,
    type: req.body.type,
    deadline: req.body.deadline,
    questions: req.body.questions,
    season: req.body.season,
  });

  const newTask = {
    _id: task._id,
    points: task.points,
    title: task.title,
    desc: task.desc,
    type: task.type,
    startDate: task.startDate,
    deadline: task.deadline,
    questions: task.questions,
    season: req.body.season,
  };

  try {
    const savedTask = await task.save();

    if (savedTask) {
      console.log(req.body.season);

      await Season.findByIdAndUpdate(
        req.body.season,
        {
          $push: { tasks: newTask },
          $inc: { totalTasks: 1 },
        },

        { new: true }
      );

      agenda.schedule(
        savedTask.startDate, // date the function will execute
        "open task",
        { taskId: task._id } // add additional information to be accessed by the function
      );
      agenda.schedule(
        savedTask.deadline, // date the function will execute
        "close task",
        { taskId: task._id } // add additional information to be accessed by the function
      );
      sendNotification();
      return res.status(201).json(savedTask);
    } else {
      return res.status(400).json("Failed to create task");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

//get all tasks for a season
const getAllTasks = expressAsyncHandler(async (req, res) => {
  try {
    const season = req.params.id;
    const tasks = await Task.find({ season: season }).sort({ createdAt: -1 });
    if (!tasks) {
      return res.status(400).json({ error: "No tasks for this season" });
    } else {
      return res.status(200).json(tasks);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all pendings tasks for the user
const getPendingTasks = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //get the current ongoing season
    const season = await Season.findOne({
      status: "ongoing",
    });

    if (!season) {
      return res.status(400).json({ error: "There is no ongoing season" });
    }

    const tasks = await Task.find({
      season: season,
      _id: { $nin: user.completedTasks },
    }).sort({ createdAt: -1 });

    if (!tasks) {
      return res.status(400).json({ error: "No pending task for this season" });
    }
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(400).json(error);
  }
};

//get all completed tasks for a user
const getCompletedTasks = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //get the current ongoing season
    const season = await Season.findOne({
      status: "ongoing",
    });

    if (!season) {
      return res.status(400).json({ error: "There is no ongoing season" });
    }

    const tasks = await Task.find({
      season: season,
      _id: { $in: user.completedTasks },
    }).sort({ createdAt: -1 });

    if (!tasks) {
      return res.status(400).json({ error: "No pending task for this season" });
    }
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(400).json(error);
  }
};

//get single task
const getTask = expressAsyncHandler(async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(400).json("No Task with that id found");
    } else {
      var questions = [];
      if (task.questions.length > 0) {
        const firstQuestion = await Question.findById(task.questions[0]);
        if (!questions.includes(firstQuestion._id)) {
          questions.push(firstQuestion);
        }

        if (task.questions[1]) {
          const secondQuestion = await Question.findById(task.questions[1]);
          if (!questions.includes(secondQuestion._id)) {
            questions.push(secondQuestion);
          }
        }
        if (task.questions[2]) {
          const thirdQuestion = await Question.findById(task.questions[2]);
          if (!questions.includes(thirdQuestion._id)) {
            questions.push(thirdQuestion);
          }
        }
        if (task.questions[3]) {
          const fourthQuestion = await Question.findById(task.questions[3]);
          if (!questions.includes(fourthQuestion._id)) {
            questions.push(fourthQuestion);
          }
        }
        if (task.questions[4]) {
          const fifthQuestion = await Question.findById(task.questions[4]);
          if (!questions.includes(fifthQuestion._id)) {
            questions.push(fifthQuestion);
          }
        }

        const sentTask = {
          _id: task._id,
          title: task.title,
          disc: task.desc,
          points: task.points,
          status: task.status,
          type: task.type,
          season: task.season,
          questions: questions,
        };
        return res.status(200).json(sentTask);
      }
      return res.status(200).json(task);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//update task
const updateTask = expressAsyncHandler(async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    return res.status(200).json(task);
  } catch (err) {
    return res.status(400).json(err);
  }
});

//delete task
const deleteTask = expressAsyncHandler(async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    return res.status(200).json("Task deleted successfully");
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = {
  createTask,
  getAllTasks,
  getTask,
  getPendingTasks,
  getCompletedTasks,
  updateTask,
  deleteTask,
};
