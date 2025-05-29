const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const errors = validationResult(req);

  console.log("req", req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, preferences } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      preferences,
    });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

router.get("/preferences", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({ preferences: user.preferences });
  } catch (err) {
    next(err);
  }
});

router.put("/preferences", auth, async (req, res, next) => {
  const { preferences } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    user.preferences = preferences;
    await user.save();
    res.status(200).json({ message: "Preference added" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
