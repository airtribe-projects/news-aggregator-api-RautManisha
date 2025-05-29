const express = require("express");
const axios = require("axios");
const User = require("../models/user");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !Array.isArray(user.preferences)) {
      return res
        .status(400)
        .json({ message: "User preferences not found or invalid" });
    }
    const preferences = user.preferences
      .map((pref) => encodeURIComponent(pref))
      .join(" OR ");
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${preferences}&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.status(200).json({ news: response.data.articles });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
