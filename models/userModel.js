const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema(
  {
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    phone: { type: Number, require: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    gender: { type: String },
    isPaired: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    dob: { type: Date, default: null },
    age: { type: Number, default: null },
    pic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/previews/001/840/618/non_2x/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg",
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    ministries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ministry",
      },
    ],
    isMainAdmin: { type: Boolean, default: false },
    isSubAdmin: { type: Boolean, default: false },
    registrationComplete: { type: Boolean, default: false },
    points: {
      type: Number,
      default: 0,
    },
    completedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    eventMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventMessage",
      },
    ],
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
userSchema.plugin(uniqueValidator);

const User = mongoose.model("User", userSchema);
module.exports = User;
