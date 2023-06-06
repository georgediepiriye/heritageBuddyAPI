const expressAsyncHandler = require("express-async-handler");
const Buddies = require("../models/buddiesModel");
const Chat = require("../models/chatModel");
const Season = require("../models/seasonModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");

//create buddies
const createBuddiesGroup = expressAsyncHandler(async (req, res) => {
  const { groupName, season } = req.body;
  const buddiesGroup = new Buddies({
    groupName: groupName,
    season: season,
    users: [],
  });
  try {
    const savedGroup = await buddiesGroup.save();
    if (!savedGroup) {
      return res.status(400).json("group wasn't create successfully");
    } else {
      const chat = new Chat({
        team: savedGroup._id,
        users: [],
        season: savedGroup.season,
        latestMessage: null,
      });

      await chat.save();
      return res.status(200).json(savedGroup);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all buddies
const getAllBuddies = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const groups = await Buddies.find({ season: season })
      .populate("users")
      .populate("season");
    if (groups.length > 0) {
      return res.status(200).json(groups);
    } else {
      return res.status(400).json({ error: "No groups found" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all buddies in a season
const getAllBuddiesInSeason = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    const groups = await Buddies.find({ season: season })
      .populate("users")
      .populate("season");
    if (groups.length > 0) {
      return res.status(200).json(groups);
    } else {
      return res.status(400).json({ error: "No groups found" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});
//get top performing buddies
const getBuddiesRanks = async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const buddies = await Buddies.find({ season: season })
      .sort({ points: -1 })
      .limit(6);
    return res.status(200).json(buddies);
  } catch (error) {
    return res.status(500).json(error);
  }
};

//get single buddies
const getBuddies = expressAsyncHandler(async (req, res) => {
  try {
    const buddies = await Buddies.findById(req.params.id);
    if (buddies) {
      return res.status(200).json(buddies);
    } else {
      return res.status(400).json("Buddies with that id doesn't exist");
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//remove user from buddy group
const removeBuddy = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const removed = await Buddies.findByIdAndUpdate(
      req.body.buddies,
      {
        $pull: { users: { email: { $eq: user.email } } },
      },
      { new: true }
    );

    if (removed) {
      await User.findByIdAndUpdate(req.params.id, {
        $set: {
          isPaired: false,
          buddies: null,
        },
      });
      return res.status(200).json("user removed successfully");
    } else {
      return res.status(400).json("Something went wrong,user not removed");
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

//delete buddies
const deleteBuddies = expressAsyncHandler(async (req, res) => {
  try {
    const buddies = await Buddies.findById(req.params.id);
    const users = buddies.users;
    if (users.length > 0) {
      users.forEach(async (user) => {
        const id = user._id;
        await User.findByIdAndUpdate(id, {
          $set: { isPaired: false },
        });
      });
    }
    const deleted = await Buddies.findByIdAndDelete(req.params.id);
    if (deleted) {
      return res.status(200).json("Buddies group deleted successfully");
    } else {
      return res.status(400).json("group wasn't deleted");
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get buddies task submission status
const getBuddiesTaskSubmissionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const season = await Season.find({ status: "ongoing" });
    const task = await Task.findById(req.body.task);
    //get the team current user belongs to in ongoing season
    const team = await Buddies.findOne({
      season: season,
      "users.email": user.email,
    });
    //get other members of users group
    const buddies = team.users.filter(
      (singleBuddy) => singleBuddy.email != user.email
    );

    if (buddies.length == 0) {
      return res.status(400).json({ message: "No buddies for this user yet" });
    }
    let firstPerson = {
      //object for first buddy
      name: null,
      status: null,
    };
    let secondPerson = {
      //object for second buddy
      name: null,
      status: null,
    };
    if (buddies[0]) {
      const firstBuddy = await User.findById(buddies[0]);
      firstPerson = {
        name: firstBuddy.firstname,
        status: "pending",
      };

      if (firstBuddy.completedTasks.includes(task)) {
        firstPerson.name = firstBuddy.firstname;
        firstPerson.status = "completed";
      }
    }
    if (buddies[1]) {
      const secondBuddy = await User.findById(buddies[1]);
      if (secondBuddy) {
        secondPerson = {
          name: secondBuddy.firstname,
          status: "pending",
        };
      }

      if (secondBuddy.completedTasks.includes(task)) {
        secondPerson.name = secondBuddy.firstname;
        secondPerson.status = "completed";
      }
    }

    return res.status(200).json({
      firstBuddy: firstPerson,
      secondPerson: secondPerson,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports = {
  createBuddiesGroup,
  getAllBuddies,
  getAllBuddiesInSeason,
  getBuddiesRanks,
  removeBuddy,
  getBuddiesTaskSubmissionStatus,
  getBuddies,
  deleteBuddies,
};
