const Task = require("../../models/taskModel");

module.exports = (agenda) => {
  agenda.define("open task", (job, done) => {
    console.log("opening task...");
    // get the data passed when scheduling the job in the controller
    let taskId = job.attrs.data.taskId;
    Task.findByIdAndUpdate(
      taskId,
      {
        $set: { status: "ongoing" },
      },
      (error) => {
        if (!error) {
          console.log("Task successfully open");
          done();
        } else {
          console.log("Error opening task");
          console.log(error);
          done();
        }
      }
    );
  });
};
