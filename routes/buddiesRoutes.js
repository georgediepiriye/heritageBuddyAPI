const router = require("express").Router();
const {
  createBuddiesGroup,
  getAllBuddies,
  getAllBuddiesInSeason,
  getBuddies,
  getBuddiesRanks,
  getBuddiesTaskSubmissionStatus,
  removeBuddy,
  deleteBuddies,
} = require("../controllers/buddiesController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create buddies
router.post("/", createBuddiesGroup);

//remove buddy
router.put("/remove/:id", removeBuddy);

//get all buddies in a season
router.get("/season/:id", getAllBuddiesInSeason);

//get all buddies
router.get("/", getAllBuddies);

//get buddies ranks
router.get("/ranks", getBuddiesRanks);

//get buddies task submission status
router.get("/task_status/:id", getBuddiesTaskSubmissionStatus);

//get single buddies
router.get("/:id", getBuddies);

//delete buddies
router.delete("/del/:id", deleteBuddies);

module.exports = router;
