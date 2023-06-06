const router = require("express").Router();
const { sendFirebaseToken } = require("../controllers/firebaseTokenController");
const { verifyToken } = require("./verifyToken");

router.post("/", verifyToken, sendFirebaseToken);

module.exports = router;
