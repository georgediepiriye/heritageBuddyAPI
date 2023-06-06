const FCM = require("fcm-node");
const FirebaseToken = require("../models/tokenModel");

const sendNotification = async () => {
  console.log("got to notification here...");
  const serverKey = process.env.SERVER_KEY;
  const fcm = new FCM(serverKey);

  const firebaseTokens = await FirebaseToken.find();

  const tokens = [];
  firebaseTokens.forEach((firebaseToken) => {
    tokens.push(firebaseToken.token);
  });

  const message = {
    registration_ids: tokens,

    notification: {
      title: "Heritage Buddy",
      body: "Hello, a new task has been added!",
    },
    android: {
      notification: {
        sound: "default",
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    },
  };
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!", err);
    } else {
      console.log("Successfully sent push notification!");
    }
  });
};

module.exports = { sendNotification };
