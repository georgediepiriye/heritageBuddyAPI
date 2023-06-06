const router = require("express").Router();
const {
  createDepartment,
  getAllDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

//create department
router.post("/", createDepartment);

//get all departments
router.get("/", getAllDepartments);

//get single department
router.get("/:id", getDepartment);

//update department
router.put("/:id", updateDepartment);

//delete department
router.delete("/:id", deleteDepartment);

module.exports = router;
