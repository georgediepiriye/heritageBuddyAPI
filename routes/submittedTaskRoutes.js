const router = require("express").Router();
const {
  getAllPendingSubmittedTasksAdmin,
  getAllPendingSubmittedTasksRanger,
  getAllAcceptedSubmittedTasks,
  getAllRejectedSubmittedTasks,
  getSingleSubmittedTasks,
  acceptSubmittedTask,
  rejectSubmittedTask,
} = require("../controllers/submittedTaskController");

const cloudinary = require("../utils/cloudinary");
const SubmittedTask = require("../models/submittedTaskModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Season = require("../models/seasonModel");
const Buddies = require("../models/buddiesModel");
const Question = require("../models/questionModel");
const Notification = require("../models/notificationModel");
const { verifyToken } = require("./verifyToken");

//submit task
router.post("/:id", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(400).json({
        error: "No task with that id found",
      });
      return;
    }
    const user = await User.findById(req.body.user);

    if (task.type === "image" || task.type === "video") {
      let imageResult = null;
      let videoResult = null;

      if (req.files.image) {
        const imageFile = req.files.image;
        imageResult = await cloudinary.uploader.upload(
          imageFile.tempFilePath,
          (err, imageResult) => {}
        );
      }
      if (req.files.video) {
        const videoFile = req.files.video;
        videoResult = await cloudinary.uploader.upload(
          videoFile.tempFilePath,
          {
            resource_type: "video",
            chunk_size: 6000000,
            eager: [
              { width: 300, height: 300, crop: "pad", audio_codec: "none" },
              {
                width: 160,
                height: 100,
                crop: "crop",
                gravity: "south",
                audio_codec: "none",
              },
            ],
            eager_async: true,
          },
          (err, videoResult) => {}
        );
      }

      let imageUrl = null;
      let videoUrl = null;

      if (imageResult != null) {
        imageUrl = imageResult.url;
      }
      if (videoResult != null) {
        videoUrl = videoResult.url;
      }

      const submitTask = new SubmittedTask({
        image: imageUrl,
        video: videoUrl,
        user: user,
        task: task,
        season: task.season,
      });

      const taskSubmitted = await submitTask.save();
      if (taskSubmitted) {
        await User.findByIdAndUpdate(
          user,
          {
            $addToSet: { completedTasks: task },
          },
          { new: true }
        );

        res.status(200).json({ message: "Task submitted succesfully" });
        return;
      } else {
        res.status(400).json({
          error: "task wasn't submitted,please try again",
        });
        return;
      }
    } else if (task.type === "theory") {
      const submitTask = new SubmittedTask({
        desc: req.body.desc,
        user: user,
        task: task,
        season: task.season,
      });

      const taskSubmitted = await submitTask.save();
      if (taskSubmitted) {
        await User.findByIdAndUpdate(
          user,
          {
            $addToSet: { completedTasks: task },
          },
          { new: true }
        );
        res.status(200).json({ message: "Task submitted succesfully" });
        return;
      } else {
        res.status(400).json({
          error: "task wasn't submitted,please try again",
        });
        return;
      }
    } else {
      const submitTask = new SubmittedTask({
        user: user,
        answers: req.body.answers,
        task: task,
        season: task.season,
        isObjective: true,
      });
      console.log(`answers is ${req.body.answers}`);
      console.log(submitTask);

      const taskSubmitted = await submitTask.save();
      if (taskSubmitted) {
        await User.findByIdAndUpdate(
          user,
          {
            $addToSet: { completedTasks: task },
          },
          { new: true }
        );

        const team = await Buddies.findOne({
          season: task.season,
          "users.email": user.email,
        });
        var questionsPoints = 0;

        var questionPointsTarget = task.points;
        var eachQuestionPoint = questionPointsTarget / task.questions.length;

        //if there is a first question
        if (task.questions[0]) {
          const question1 = await Question.findById(task.questions[0]);

          if (
            question1.answer.toLowerCase() ==
            taskSubmitted.answers[0].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }

          console.log("Got here for question 1");
          console.log("points after question 1 " + questionsPoints);
        }

        //if there is a second question
        if (task.questions[1]) {
          const question2 = await Question.findById(task.questions[1]);
          if (
            question2.answer.toLowerCase() ==
            taskSubmitted.answers[1].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
          console.log("Got here for question 2");
          console.log("points after question 2 " + questionsPoints);
        }

        //if there is a third question
        if (task.questions[2]) {
          const question3 = await Question.findById(task.questions[2]);
          if (
            question3.answer.toLowerCase() ==
            taskSubmitted.answers[2].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a forth question
        if (task.questions[3]) {
          const question4 = await Question.findById(task.questions[3]);
          if (
            question4.answer.toLowerCase() ==
            taskSubmitted.answers[3].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a fifth question
        if (task.questions[4]) {
          const question5 = await Question.findById(task.questions[4]);
          if (
            question5.answer.toLowerCase() ==
            taskSubmitted.answers[4].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a sixth question
        if (task.questions[5]) {
          const question6 = await Question.findById(task.questions[5]);
          if (
            question6.answer.toLowerCase() ==
            taskSubmitted.answers[5].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a seventh question
        if (task.questions[6]) {
          const question7 = await Question.findById(task.questions[6]);
          if (
            question7.answer.toLowerCase() ==
            taskSubmitted.answers[6].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is an eight question
        if (task.questions[7]) {
          const question8 = await Question.findById(task.questions[7]);
          if (
            question8.answer.toLowerCase() ==
            taskSubmitted.answers[7].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a  ninth question
        if (task.questions[8]) {
          const question9 = await Question.findById(task.questions[8]);
          if (
            question9.answer.toLowerCase() ==
            taskSubmitted.answers[8].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        //if there is a  tenth question
        if (task.questions[9]) {
          const question10 = await Question.findById(task.questions[9]);
          if (
            question10.answer.toLowerCase() ==
            taskSubmitted.answers[9].toLowerCase()
          ) {
            questionsPoints = questionsPoints + eachQuestionPoint;
          }
        }

        const graded = await SubmittedTask.findByIdAndUpdate(
          taskSubmitted,
          {
            $set: {
              isGraded: true,
              isAccepted: true,
            },
          },
          { new: true }
        );

        if (graded) {
          console.log("got nsie graded, total points is " + totalPoints);
          await Buddies.findByIdAndUpdate(team, {
            $set: {
              points: team.points + questionsPoints,
            },
          });

          const gradedUser = await User.findByIdAndUpdate(
            user,
            {
              $set: { points: user.points + totalPoints },
            },
            { new: true }
          );
          const today = new Date(Date.now());
          const date = today.toISOString();
          const notification = new Notification({
            user: user,
            message: `Congratulations, your task submission has been graded,your team just won ${totalPoints}points.`,
            time: date,
            season: task.season,
          });
          await notification.save();

          //users in the group
          const users = team.users;

          //current season
          const season = await Season.findOne({ status: "ongoing" });

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

          res.status(200).json({ message: "task was graded successfully" });
          return;
        } else {
          res.status(400).json({ error: "task wasn't graded,try again" });
          return;
        }
      } else {
        res.status(400).json({
          error: "task wasn't submitted,please try again",
        });
        return;
      }
    }
  } catch (error) {
    res.status(200).json(error);
  }
});

//get all pending submitted tasks for a season admin
router.get("/pending/admin", getAllPendingSubmittedTasksAdmin);

//get all pending submitted tasks for a season ranger
router.get("/pending/ranger/:id", getAllPendingSubmittedTasksRanger);

//get all accepted submitted tasks for a season
router.get("/accepted", getAllAcceptedSubmittedTasks);

//get all rejected submitted tasks for a season
router.get("/rejected", getAllRejectedSubmittedTasks);

//get single submitted tasks for a season
router.get("/:id", getSingleSubmittedTasks);

//accept submitted task
router.post("/accept/:id", acceptSubmittedTask);

//reject submitted task
router.post("/reject/:id", rejectSubmittedTask);

module.exports = router;
