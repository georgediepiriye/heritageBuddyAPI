const router = require("express").Router();
const { getMilestone } = require("../controllers/milestoneController");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

//get milestone
router.get("/:id", verifyToken, getMilestone);

module.exports = router;
