const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  passport.authenticate(
    "signup",
    { session: false },
    async (err, user, info) => {
      if (!user) {
        return res.json(info);
      }

      const body = { _id: user._id, username: user.username };

      return res.json({
        message: "Signup successful",
        user: req.user,
        token: jwt.sign({ user: body }, "TOP_SECRET"),
      });
    }
  )(req, res, next);
});

router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred.");

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, "TOP_SECRET");

        return res.json({ token, username: user.username });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;
