let Agenda = require("agenda");

let agenda = new Agenda({
  db: { address: process.env.MONGO_URI, collection: "jobs" },
});

// list the different jobs availale throughout the app
let jobTypes = [
  "startSeasonJob",
  "endSeasonJob",
  "openTaskJob",
  "closeTaskJob",
];

// loop through the job_list folder and pass in the agenda instance
jobTypes.forEach((type) => {
  // the type name should match the file name in the jobs_list folder
  require("./jobs_list/" + type)(agenda);
});
//  set up agenda
agenda.on("ready", async () => await agenda.start());

let graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

module.exports = agenda;
