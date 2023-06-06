const expressAsyncHandler = require("express-async-handler");
const Event = require("../models/eventModel");
const Season = require("../models/seasonModel");
const cloudinary = require("../utils/cloudinary");

//create event
const createEvent = expressAsyncHandler(async (req, res) => {
  const { title, date } = req.body;
  let owner = null;
  let type = "general";
  if (!title || !date) {
   return res.status(400).json({ error: "Please enter all fields" });
    
  }
  if (req.body.owner) {
    owner = req.body.owner;
  }
  if (req.body.type) {
    type = req.body.type;
  }

  const imageFile = req.body.image;

  if (imageFile == null) {
   return res.status(400).json({ error: "Please select an image" });
    
  }
  try {
    const imageResult = await cloudinary.uploader.upload(
      imageFile,
      (err, imageResult) => {}
    );

    let dateObj = new Date(date);
    const day = dateObj.getDate();

    const month = dateObj.getMonth() + 1;
    const dayAndMonth = `${day}/${month}`;

    const event = new Event({
      image: imageResult.url,
      title: title,
      date: dayAndMonth,
      type: type,
      owner: owner,
    });

    const savedEvent = await event.save();

    if (savedEvent) {
     return res.status(201).json(savedEvent);
    } else {
     return res.status(400).json("Failed to create event");
      
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//get all events for the day
const getAllTodayEvents = expressAsyncHandler(async (req, res) => {
  try {
    const season = await Season.findOne({ status: "ongoing" });
    const today = new Date(Date.now());
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const dayAndMonth = `${day}/${month}`;
    const events = await Event.find({ season: season, date: dayAndMonth }).sort(
      {
        createdAt: -1,
      }
    );
    if (events.length == 0) {
     return res.status(400).json({ error: "There are no events today" });
     
    } else {
     return res.status(200).json(events);
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//get all events for the season
const getAllEvents = expressAsyncHandler(async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });
    if (events.length == 0) {
     return res.status(400).json({ error: "There are no events" });
     
    } else {
     return res.status(200).json(events);
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//get single event
const getEvent = expressAsyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
     return res.status(400).json({ error: "No event with that id found" });
      
    } else {
     return res.status(200).json(event);
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//update event
const updateEvent = expressAsyncHandler(async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

  return res.status(200).json(event);
  } catch (err) {
   return res.status(500).json(err);
  }
});

//delete event
const deleteEvent = expressAsyncHandler(async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
   return res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
   return res.status(500).json(err);
  }
});

module.exports = {
  createEvent,
  getAllEvents,
  getAllTodayEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
};
