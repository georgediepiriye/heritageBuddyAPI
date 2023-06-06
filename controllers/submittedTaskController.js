const SubmittedTask = require("../models/submittedTaskModel");
const Task = require("../models/taskModel");
const Question = require("../models/questionModel");
const User = require("../models/userModel");
const Season = require("../models/seasonModel");
const Buddies = require("../models/buddiesModel");
const Notification = require("../models/notificationModel");

//get all pending submitted tasks for a season admin
const getAllPendingSubmittedTasksAdmin = async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const submittedTasks = await SubmittedTask.find({
      season: season,
      isAccepted: false,
      isGraded: false,
      isObjective: false,
    })
      .populate("user")
      .populate("task");
    if (submittedTasks.length == 0) {
    return res
      .status(400)
      .json({ error: "No pending submitted tasks for this season" });
      
    }
   return res.status(200).json(submittedTasks);
  } catch (error) {
   return res.status(400).json(error);
  }
};

//get all pending submitted tasks for a season ranger
const getAllPendingSubmittedTasksRanger = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const season = await Season.findOne({ status: "ongoing" });
    //get the team current user belongs to in ongoing season
    const team = await Buddies.findOne({
      season: season,
      "users.email": user.email,
    });

    const submittedTasks = await SubmittedTask.find({
      season: season,
      isAccepted: false,
      isGraded: false,
      isObjective: false,
      user: { $nin: team.users },
    })
      .populate("user")
      .populate("task");
    if (submittedTasks.length == 0) {
    return res
      .status(400)
      .json({ error: "No pending submitted tasks for this season" });
     
    }
   return res.status(200).json(submittedTasks);
  } catch (error) {
   return res.status(400).json(error);
  }
};

//get all accepted submitted tasks for a season
const getAllAcceptedSubmittedTasks = async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const submittedTasks = await SubmittedTask.find({
      season: season,
      isAccepted: true,
      isGraded: true,
    })
      .populate("user")
      .populate("task");
    if (submittedTasks.length == 0) {
    return res
      .status(400)
      .json({ error: "No accepted submitted tasks for this season" });
     
    }
   return res.status(200).json(submittedTasks);
  } catch (error) {
   return res.status(400).json(error);
  }
};

//get all rejected submitted tasks for a season
const getAllRejectedSubmittedTasks = async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const submittedTasks = await SubmittedTask.find({
      season: season,
      isAccepted: false,
      isGraded: true,
    })
      .populate("user")
      .populate("task");
    if (submittedTasks.length == 0) {
    return res
      .status(400)
      .json({ error: "No rejected submitted tasks for this season" });
      
    }
   return res.status(200).json(submittedTasks);
  } catch (error) {
  return res.status(400).json(error);
  }
};

//get single submitted tasks for a season
const getSingleSubmittedTasks = async (req, res) => {
  try {
    const submittedTask = await SubmittedTask.findById(req.params.id)
      .populate("user")
      .populate("task");
    if (!submittedTask) {
     return res.status(400).json({ error: "No submitted task with that id" });
      
    }
   return res.status(200).json(submittedTask);
  } catch (error) {
   return res.status(400).json(error);
  }
};

//accept submitted task
const acceptSubmittedTask = async (req, res) => {
  try {
    const submitTask = await SubmittedTask.findById(req.params.id);
    if (!submitTask) {
    return res
      .status(400)
      .json({ error: "No submitted task with this id found" });
      
    }
    if (submitTask.isGraded) {
     return res.status(400).json({ error: "Submission already graded" });
      
    }

    const submittedTask = await SubmittedTask.findById(req.params.id);

    const task = await Task.findById(submittedTask.task);

    const taskPoint = task.points;
    const season = await Season.findOne({ status: "ongoing" });
    const user = await User.findById(submittedTask.user);
    const team = await Buddies.findOne({
      season: season,
      "users.email": user.email,
    });

    const graded = await SubmittedTask.findByIdAndUpdate(
      submittedTask,
      {
        $set: {
          isGraded: true,
          isAccepted: true,
        },
      },
      { new: true }
    );
    if (graded) {
      const gradedBuddies = await Buddies.findByIdAndUpdate(
        team,
        {
          $set: {
            points: team.points + taskPoint,
          },
        },
        { new: true }
      );

      const gradedUser = await User.findByIdAndUpdate(
        user,
        {
          $set: { points: user.points + taskPoint },
        },
        { new: true }
      );

      const today = new Date(Date.now());
      const date = today.toISOString();
      const notification = new Notification({
        user: user,
        message: `Congratulations, your task submission has been accepted,you and your team just won ${taskPoint} points.`,
        time: date,
        season: season,
      });
      await notification.save();

      //users in the group
      const users = gradedBuddies.users;

      users.map(async (user) => {
        if (user.email === gradedUser.email) {
          const newUser = {
            firstname: gradedUser.firstname,
            lastname: gradedUser.lastname,
            pic: gradedUser.pic,
            phone: gradedUser.phone,
            departments: gradedUser.departments,
            ministries: gradedUser.ministries,
            points: gradedUser.points,
            email: gradedUser.email,
          };

          await Buddies.findOneAndUpdate(
            { "users.email": user.email, season: season },
            {
              $set: { "users.$": newUser },
            },
            { new: true }
          );
        }
      });

    return res.status(200).json({ message: "task was graded successfully" });
      
    } else {
     return res.status(400).json({ error: "task wasn't graded, try again" });
     
    }
  } catch (error) {
   return res.status(400).json(error);
  }
};

//reject submitted task
const rejectSubmittedTask = async (req, res) => {
  try {
    const submitTask = await SubmittedTask.findById(req.params.id).populate(
      "user"
    );

    const user = submitTask.user;

    if (!submitTask) {
     return res
       .status(400)
       .json({ error: "No submitted task with this id found" });
      
    }

    if (!submitTask.isGraded) {
     return res.status(400).json({ error: "Submission already graded" });
      
    }
    const rejectedSubmittedTask = await SubmittedTask.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isGraded: true,
          isAccepted: false,
        },
      },
      { new: true }
    );
    const season = await Season.findOne({ status: "ongoing" });

    if (rejectedSubmittedTask) {
      const today = new Date(Date.now());
      const date = today.toISOString();
      const notification = new Notification({
        user: user,
        message: `I'm sorry, your task submission has been rejected,your team got 0 points.`,
        time: date,
        season: season,
      });
      await notification.save();
     
     return res
       .status(200)
       .json({ message: "submitted task has been rejected" });
    }
  } catch (error) {
   return res.status(400).json(error);
  }
};

module.exports = {
  getAllPendingSubmittedTasksAdmin,
  getAllPendingSubmittedTasksRanger,
  getAllAcceptedSubmittedTasks,
  getAllRejectedSubmittedTasks,
  getSingleSubmittedTasks,
  acceptSubmittedTask,
  rejectSubmittedTask,
};
