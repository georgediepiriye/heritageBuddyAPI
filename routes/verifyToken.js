const jwt = require("jsonwebtoken");

//verify user token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) {
        return res.status(400).json({ error: "Token is not valid" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(400).json({ error: "You are not authenticated" });
  }
};

//verify user token and check if authorized
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isMainAdmin) {
      next();
    } else {
      res.status(400).json({ error: "You are not authorized to do this" });
    }
  });
};

//verify token and check if user is an admin
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isMainAdmin) {
      next();
    } else {
      res.status(400).json({ error: "You are not authorized to do that" });
    }
  });
};
module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
