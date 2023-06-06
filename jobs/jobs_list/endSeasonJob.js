const Season = require("../../models/seasonModel");
const Buddies = require("../../models/buddiesModel");
const User = require("../../models/userModel");

module.exports = (agenda) => {
  agenda.define("end season", async (job, done) => {
    console.log("ending season ...");
    // get the data passed when scheduling the job in the controller
    let seasonId = job.attrs.data.seasonId;
    try {
      const season = await Season.findByIdAndUpdate(seasonId, {
        $set: { status: "completed" },
      });

      // //get a group with members in this season
      const buddies = await Buddies.find({
        season: season,
        "users.length": { $gt: 0 },
      });

      buddies.forEach((buddy) => {
        const numberOfUsers = buddy.users.length;
        const users = buddy.users;

        const totalPoints = buddy.points;
        if (totalPoints > 0) {
          const userPoint = totalPoints / numberOfUsers;
          users.forEach((user) => {
            User.updateMany(
              { user },
              {
                $set: {
                  points: userPoint,
                  isPaired: false,
                },
              }
            );
          });
        } else {
          users.forEach((user) => {
            User.findByIdAndUpdate(
              { user },
              {
                $set: {
                  points: 0,
                  isPaired: false,
                },
              }
            );
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    done();
  });
};
