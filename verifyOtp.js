const request = require("request");

//send  otp to email
const verify = async (req, res) => {
  const email = req.body.email;
  const firstname = req.body.firstname;

  try {
    var options = {
      method: "POST",
      url: "https://api.sendchamp.com/api/v1/verification/create",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEND_CHAMP_TOKEN}`,
      },
      body: JSON.stringify({
        channel: "email",
        token_type: "numeric",
        token_length: "5",
        sender: "heritagebuddyz@gmail.com",
        expiration_time: 6,
        customer_email_address: email,

        meta_data: { first_name: firstname },
      }),
    };

    request(options, function (err, response) {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(200).send(response.body);
        console.log(response.body);
      }
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

//verifies otp
const check = async (req, res) => {
  const code = req.body.code;
  const reference = req.body.reference;

  var options = {
    method: "POST",
    url: "https://api.sendchamp.com/api/v1/verification/confirm",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SEND_CHAMP_TOKEN}`,
    },
    body: JSON.stringify({
      verification_code: code,
      verification_reference: reference,
    }),
  };

  request(options, function (error, response) {
    if (error) {
      res.status(400).json(error);
    } else {
      res.status(200).send(response.body);
    }
  });
};

module.exports = { verify, check };
