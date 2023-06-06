const Season = require("../../models/seasonModel");

module.exports = (agenda) => {
  agenda.define("start season", (job, done) => {
    console.log("starting season ...");
    // get the data passed when scheduling the job in the controller
    let seasonId = job.attrs.data.seasonId;
    Season.findByIdAndUpdate(
      seasonId,
      {
        $set: { status: "ongoing" },
      },
      (error) => {
        if (!error) {
          console.log("Season successfully started");
          done();
        } else {
          console.log("Error starting season");
          console.log(error);
          done();
        }
      }
    );
  });
};
