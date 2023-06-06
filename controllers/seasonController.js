const expressAsyncHandler = require("express-async-handler");
const agenda = require("../jobs/agenda");
const Buddies = require("../models/buddiesModel");
const Season = require("../models/seasonModel");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const EventMessage = require("../models/eventMessageModel");
const Chat = require("../models/chatModel");

//create season
const createSeason = expressAsyncHandler(async (req, res) => {
  const { startDate, endDate, milestone, reward } = req.body;
  if (!startDate || !endDate || !milestone || !reward) {
   return res.status(400).json("Please enter all fields");
    
  }

  const season = new Season({
    startDate: startDate,
    endDate: endDate,
    milestone: milestone,
    reward: reward,
  });
  try {
    const savedSeason = await season.save();

    if (savedSeason) {
      // if the season is successfully saved in the database, schedule a job with a unique id in the job collection
      agenda.schedule(
        savedSeason.startDate, // date the function will execute
        "start season",
        { seasonId: season._id } // add additional information to be accessed by the function
      );
      agenda.schedule(
        savedSeason.endDate, // date the function will execute
        "end season",
        { seasonId: season._id } // add additional information to be accessed by the function
      );
     return res.status(201).json(savedSeason);
    } else {
     return res.status(400).json("Failed to create season");
    }
  } catch (error) {
  return res.status(400).json(error);
  }
});

//get all seasons
const getAllSeasons = expressAsyncHandler(async (req, res) => {
  const seasons = await Season.find();
  if (!seasons) {
   return res.status(400).json("Failed to get all seasons");
    
  } else {
   return res.status(200).json(seasons);
  }
});

//get single season
const getSeason = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) {
    return res.status(400).json({ error: "No season with that id found" });
      
    }
   return res.status(200).json(season);
  } catch (err) {
   return res.status(400).json(err);
  }
});

//update season
const updateSeason = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

   return res.status(200).json(season);
  } catch (err) {
   return res.status(500).json(err);
  }
});

//delete season
const deleteSeason = expressAsyncHandler(async (req, res) => {
  try {
    await Season.findByIdAndDelete(req.params.id);
   return res.status(200).json({ message: "season deleted successfully" });
  } catch (err) {
   return res.status(500).json(err);
  }
});

//ongoing season
const ongoingSeason = async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    if (!season) {
     return res.status(400).json({ error: "There is no ongoing season" });
      
    }
   return res.status(200).json(season);
  } catch (error) {
  return res.status(500).json(error);
  }
};

//pending seasons
const pendingSeasons = async (req, res) => {
  try {
    const seasons = await Season.find({ status: "pending" });
    if (seasons.length == 0) {
     return res.status(400).json({ error: "There is no pending seasons" });
      
    }
   return res.status(200).json(seasons);
  } catch (error) {
   return res.status(500).json(error);
  }
};

//completed seasons
const completedSeasons = async (req, res) => {
  try {
    const seasons = await Season.find({ status: "completed" });
    if (seasons.length == 0) {
     return res.status(400).json({ error: "There is no competed season" });
     
    }
   return res.status(200).json(seasons);
  } catch (error) {
   return res.status(500).json(error);
  }
};

//user ongoing season
const getOngoingSeason = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    //get the current ongoing season
    const season = await Season.findOne({
      status: "ongoing",
    });

    if (!season) {
     return res.status(400).json({ error: "There is no ongoing season" });
      
    }

    //get completed task
    const completedTasks = await Task.find({
      season: season,
      _id: { $in: user.completedTasks },
    });

    //number of completed tasks
    const numberOfCompletedTasks = completedTasks.length;

    //get the team current user belongs to in ongoing season
    const team = await Buddies.findOne({
      season: season,
      "users.email": user.email,
    });

    //if user doesn't have a team
    if (!team) {
      //create a buddy object from the user
      const buddy = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        pic: user.pic,
        dob: user.dob,
        gender: user.gender,
        age: user.age,
        points: user.points,
        phone: user.phone,
        departments: user.departments,
        ministries: user.ministries,
      };
      const lowerBound = buddy.age - 10; //lower bound for age range
      const upperBound = buddy.age + 10; //upper bound for age range
      const groups = await Buddies.find({
        //find buddy groups
        $or: [
          {
            $and: [
              { "users.2": { $exists: false } },
              {
                $or: [
                  { "users.0.gender": { $ne: buddy.gender } },
                  { "users.1.gender": { $ne: buddy.gender } },
                ],
              },
              { "users.0.age": { $gte: lowerBound, $lte: upperBound } },
            ],
          },
          { users: { $size: 0 } },
        ],
      });

      if (groups.length > 0) {
        //get a single random group from possible groups
        const group = groups[Math.floor(Math.random() * groups.length)];

        //find the group and save the user in the users array
        const pairedGroup = await Buddies.findByIdAndUpdate(
          group._id,
          {
            $addToSet: { users: buddy },
          },
          { new: true }
        );

        if (pairedGroup) {
          //add user to chat group
          await Chat.findOneAndUpdate(
            { team: pairedGroup },
            {
              $addToSet: { users: user },
            },
            { new: true }
          );

          //find user and change paired status
          const userPaired = await User.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                isPaired: true,
              },
            },
            { new: true }
          )
            .populate("ministries")
            .populate("departments");

          if (userPaired) {
            const unreadMessagesCount = await EventMessage.find({
              receiver: user,
              season: season,
              status: "unread",
            }).count();

            const userCompletedTasks = user.completedTasks.length;

            const teamPosition = await Buddies.find({
              season: season,
              _id: { $lt: pairedGroup._id },
            })
              .sort({ points: -1 })
              .count();
            const { password, ...others } = userPaired._doc;

          return res.status(200).json({
            group: pairedGroup,
            user: others,
            season: season,
            userCompletedTasks: userCompletedTasks,
            tasksCompleted: numberOfCompletedTasks,
            rank: teamPosition + 1,
            unreadMessagesCount: unreadMessagesCount,
          });
            
          } else {
           return res.status(400).json({ error: "User was not paired" });
            
          }
        } else {
         return res.status(400).json({ error: "User was not paired" });
          
        }
      } else {
       return res.status(400).json({ error: "User was not paired" });
       
      }
    } else {
      const unreadMessagesCount = await EventMessage.find({
        receiver: user,
        season: season,
        status: "unread",
      }).count();
      const userCompletedTasks = user.completedTasks.length;

      const teamPosition = await Buddies.find({
        season: season,
        _id: { $lt: team._id },
      })
        .sort({ points: -1 })
        .count();

      const { password, ...others } = user._doc;
     return res.status(200).json({
       group: team,
       user: others,
       season: season,
       userCompletedTasks: userCompletedTasks,
       tasksCompleted: numberOfCompletedTasks,
       rank: teamPosition + 1,
       unreadMessagesCount: unreadMessagesCount,
     });
    }
  } catch (err) {
   return res.status(400).json(err);
  }
};

//completed season
const getCompletedSeasons = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const seasons = await Season.find({
      status: "completed",
    });

    //get the team current user belongs to in completed season
    const teams = await Buddies.find({
      season: seasons,
      "users.email": user.email,
    }).populate("season");

    if (teams.length == 0) {
     return res
       .status(400)
       .json({ error: "No team for this user in this season" });
      
    }

   return res.status(200).json(teams);
  } catch (err) {
   return res.status(400).json(err);
  }
};

module.exports = {
  createSeason,
  getAllSeasons,
  getSeason,
  updateSeason,
  deleteSeason,
  getOngoingSeason,
  getCompletedSeasons,
  ongoingSeason,
  pendingSeasons,
  completedSeasons,
};
