const router = require("express").Router();
const {
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
} = require("../controllers/seasonController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//create season
router.post("/", createSeason);

//get all seasons
router.get("/", getAllSeasons);

//get ongoing season
router.get("/ongoing", ongoingSeason);

//get pending seasons
router.get("/pending", pendingSeasons);

//get completed seasons
router.get("/complete", completedSeasons);

//get user completed season
router.get("/completed", verifyToken, getCompletedSeasons);

//get single season
router.get("/:id", getSeason);

//update season
router.put("/:id", updateSeason);

//delete season
router.delete("/:id", deleteSeason);

//get ongoing season
router.get("/ongoing/:id", verifyToken, getOngoingSeason);

//get ongoing season from admin
router.get("/admin/ongoing/:id", getOngoingSeason);

//get completed season
router.get("/completed/:id", verifyToken, getCompletedSeasons);

module.exports = router;
