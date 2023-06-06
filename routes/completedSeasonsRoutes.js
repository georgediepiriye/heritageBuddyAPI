const router = require("express").Router();
const { getCompletedSeasons } = require("../controllers/seasonController");

//get completed season
router.get("/", getCompletedSeasons);

module.exports = router;
