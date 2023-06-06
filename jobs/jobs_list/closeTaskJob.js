const Task = require("../../models/taskModel");

module.exports = (agenda) => {
  agenda.define("close task", (job, done) => {
    console.log("closing task...");
    // get the data passed when scheduling the job in the controller
    let taskId = job.attrs.data.taskId;
    try {
      Task.findByIdAndUpdate(
        taskId,
        {
          $set: { status: "closed" },
        },
        (error) => {
          if (!error) {
            console.log("Task closed successfully");
            done();
          } else {
            console.log("Error closing task");
            console.log(error);
            done();
          }
        }
      );
    } catch (error) {
      console.log(error);
    }

    done();
  });
};
