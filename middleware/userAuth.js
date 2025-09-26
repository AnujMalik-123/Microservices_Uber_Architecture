const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const blacklisttokenModel = require("../models/blacklist.models");

module.exports.userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: " phele Unauthorized" });
    }

    const isBlacklisted = await blacklisttokenModel.find({ token });

    if (isBlacklisted.length) {
      return res.status(401).json({ message: " phele ke baad Unauthorized" });
    }

    console.log(token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await userModel.findById(decoded.id || decoded.userId);

    if (!user) {
      return res.status(401).json({ message: " sabse baad Unauthorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
