const expressAsyncHandler = require("express-async-handler");
const Department = require("../models/departmentModel");

//create department
const createDepartment = expressAsyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json("Please enter Department name");
  }

  const department = new Department({
    name: name,
  });

  try {
    const savedDepartment = await department.save();

    if (savedDepartment) {
      return res.status(201).json(savedDepartment);
    } else {
      return res.status(400).json("Failed to create department");
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get all departments
const getAllDepartments = expressAsyncHandler(async (req, res) => {
  try {
    const departments = await Department.find();
    if (!departments) {
      return res.status(400).json("Failed to get all departments");
    } else {
      return res.status(200).json(departments);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//get single department
const getDepartment = expressAsyncHandler(async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(400).json("No Department with that id found");
    } else {
      return res.status(200).json(department);
    }
  } catch (err) {
    return res.status(400).json(err);
  }
});

//update department
const updateDepartment = expressAsyncHandler(async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    return res.status(200).json(department);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//delete department
const deleteDepartment = expressAsyncHandler(async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
