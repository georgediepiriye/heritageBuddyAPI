const expressAsyncHandler = require("express-async-handler");
const Ministry = require("../models/ministryModel");

//create ministry
const createMinistry = expressAsyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
   return res.status(400).json("Please enter ministry name");
    
  }

  const ministry = new Ministry({
    name: name,
  });
  try {
    const savedMinistry = await ministry.save();

    if (savedMinistry) {
     return res.status(201).json(savedMinistry);
    } else {
     return res.status(400).json("Failed to create ministry");
     
    }
  } catch (err) {
   return res.status(400).json(err);
  }
});

//get all ministries
const getAllMinistries = expressAsyncHandler(async (req, res) => {
  const ministries = await Ministry.find();
  if (!ministries) {
   return res.status(400).json("Failed to get all ministries");
   
  } else {
  return res.status(200).json(ministries);
  }
});

//get single Ministry
const getMinistry = expressAsyncHandler(async (req, res) => {
  try {
    const ministry = await Ministry.findById(req.params.id);
    if (!ministry) {
     return res.status(400).json("No Ministry with that id found");
     
    } else {
     return res.status(200).json(ministry);
    }
  } catch (err) {
   return res
     .status(400)
     .json((err.message = "No Ministry with that id found"));
  }
});

//update Ministry
const updateMinistry = expressAsyncHandler(async (req, res) => {
  try {
    const ministry = await Ministry.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

   return res.status(200).json(ministry);
  } catch (err) {
   return res.status(500).json(err);
  }
});

//delete Ministry
const deleteMinistry = expressAsyncHandler(async (req, res) => {
  try {
    await Ministry.findByIdAndDelete(req.params.id);
   return res.status(200).json({ message: "Ministry deleted successfully" });
  } catch (err) {
   return res.status(500).json(err);
  }
});

module.exports = {
  createMinistry,
  getAllMinistries,
  getMinistry,
  updateMinistry,
  deleteMinistry,
};
