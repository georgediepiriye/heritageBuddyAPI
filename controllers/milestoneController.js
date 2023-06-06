const Buddies = require("../models/buddiesModel");
const Season = require("../models/seasonModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");

const getMilestone = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const season = await Season.findOne({ status: "ongoing" });
    const team = await Buddies.findOne({
      season: season,
      "users.email": user.email,
    });

    const completedTasks = await Task.find({
      season: season,
      _id: { $in: user.completedTasks },
    }).count();

    const pendingTasks = await Task.find({
      season: season,
      _id: { $in: user.completedTasks },
      status: { $ne: "closed" },
    }).count();

    const ongoingTasks = await Task.find({
      season: season,
      status: "ongoing",
    }).count();

    let percentage = Math.round((team.points / season.milestone) * 100);
    if (percentage > 100) {
      percentage = 100;
    }

    const data = {
      startDate: season.startDate,
      endDate: season.endDate,
      percentage: percentage,
      pointsNeeded: season.milestone - team.points,
      reward: season.reward,
      pointGained: user.points,
      pendingTasks: pendingTasks,
      inProgress: ongoingTasks,
      completedTasks: completedTasks,
    };
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = { getMilestone };
