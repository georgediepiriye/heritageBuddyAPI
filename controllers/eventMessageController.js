const expressAsyncHandler = require("express-async-handler");
const EventMessage = require("../models/eventMessageModel");
const Season = require("../models/seasonModel");
const User = require("../models/userModel");

//create event message
const createEventMessage = expressAsyncHandler(async (req, res) => {
  const { receiver, message } = req.body;
  if (!message) {
    return res.status(400).json("Please enter message");
  }
  const season = await Season.findOne({ status: "ongoing" });

  const eventMessage = new EventMessage({
    sender: req.params.id,
    receiver: receiver,
    message: message,
    season: season,
  });

  try {
    const savedEventMessage = await eventMessage.save();

    if (savedEventMessage) {
      return res.status(200).json({
        status: "message sent successfully!",
        eventMessage: savedEventMessage,
      });
    } else {
      return res.status(400).json({ error: "Failed to send event message" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all user's eventMessages in a season
const getAllEventMessages = expressAsyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const season = await Season.find({ status: "ongoing" });

    const userEventMessages = user.eventMessages;

    if (userEventMessages.length > 0) {
      //make all user's event message read
      await EventMessage.updateMany(
        { _id: { $in: userEventMessages } },
        {
          $set: { status: "read" },
        }
      );
    }

    // //get all user's event messages that aren't in messages array
    const unreadEventMessages = await EventMessage.find({
      receiver: user,
      season: season,
      _id: { $nin: userEventMessages },
    }).populate("sender");

    // //add all unread messages to user's messages array
    if (unreadEventMessages.length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        user,
        {
          $addToSet: {
            eventMessages: {
              $each: unreadEventMessages,
            },
          },
        },
        { new: true }
      );
      if (updatedUser) {
        const newUser = await User.findById(req.params.id);
        const newList = newUser.eventMessages;
        const eventMessages = await EventMessage.find({
          _id: { $in: newList },
        })
          .populate("sender")
          .sort({
            createdAt: -1,
          });

        return res.status(200).json(eventMessages);
      }
    }

    //get all user's event messages that are in messages array
    const eventMessages = await EventMessage.find({
      _id: { $in: userEventMessages },
    })

      .populate("sender")
      .sort({
        createdAt: -1,
      });

    if (eventMessages.length === 0) {
      return res.status(400).json({ error: "No event messages yet" });
    } else {
      return res.status(200).json({
        eventMessages: eventMessages,
      });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//delete eventMessage
const deleteEventMessage = expressAsyncHandler(async (req, res) => {
  try {
    await EventMessage.findByIdAndDelete(req.params.id);
    return res
      .status(200)
      .json({ message: "Event message deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = {
  createEventMessage,
  getAllEventMessages,
  deleteEventMessage,
};
