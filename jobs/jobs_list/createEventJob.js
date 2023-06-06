const Event = require("../../models/eventModel");
const Birthday = require("../../models/birthdayModel");

module.exports = (agenda) => {
  agenda.define("create event", async (job, done) => {});
};
