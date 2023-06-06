const router = require("express").Router();
const {
  createEvent,
  getAllEvents,
  getAllTodayEvents,
  getEvent,
  deleteEvent,
  updateEvent,
} = require("../controllers/eventController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create event
router.post("/", createEvent);

//get all events in a day
router.get("/", verifyToken, getAllTodayEvents);

//get all events in a season
router.get("/season", getAllEvents);

//get event
router.get("/:id", verifyToken, getEvent);

//update event
router.put("/:id", updateEvent);

//delete event
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
