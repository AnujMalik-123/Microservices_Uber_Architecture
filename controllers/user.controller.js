const userModel = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklisttokenModel = require("../models/blacklist.models");
const { EventEmitter } = require("events");
const { subscribeToQueue } = require("../service/rabbitmq");

const rideEventEmitter = new EventEmitter();

module.exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.status(201).json({ newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    await blacklisttokenModel.create({ token });
    res.clearCookie("token");
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.profile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.acceptedRide = async (req, res) => {
  rideEventEmitter.once("ride-accepted", (data) => {
    res.send(data);
  });

  setTimeout(() => {
    res.status(204).send();
  }, 60000);
};

subscribeToQueue("ride-accepted", async (msg) => {
  const data = JSON.parse(msg);
  rideEventEmitter.emit("ride-accepted", data);
});
