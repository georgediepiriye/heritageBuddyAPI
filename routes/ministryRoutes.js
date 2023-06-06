const router = require("express").Router();
const {
  createMinistry,
  getAllMinistries,
  getMinistry,
  updateMinistry,
  deleteMinistry,
} = require("../controllers/ministryController");

//create ministry
router.post("/", createMinistry);

//get all ministries
router.get("/", getAllMinistries);

//get single ministry
router.get("/:id", getMinistry);

//update ministry
router.put("/:id", updateMinistry);

//delete ministry
router.delete("/:id", deleteMinistry);

module.exports = router;
