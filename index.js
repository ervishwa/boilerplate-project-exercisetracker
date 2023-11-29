const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./dbConnection");
const bodyParser = require("body-parser");
require("dotenv").config();

//middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/hello", (req, res) => {
  res.send("welcome world");
});

//routes
app.post("/api/users", async (req, res) => {
  const username = req.body.username;

  try {
    const user = new User({ username });
    const data = await user.save();
    return res.status(200).json({
      username: data.username,
      _id: data._id,
    });
  } catch (e) {
    res.status(500).json({
      mess: "something went wrong",
    });
  }
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  return res.status(200).json(users);
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  let dateString;
  if (!date) {
    dateString = new Date().toDateString();
  } else {
    dateString = new Date(date).toDateString();
  }
  try {
    const user = await User.findById(_id);
    user.exercises.push({
      description,
      duration,
      date: dateString,
    });

    let response = await user.save();

    return res.status(200).json({
      _id: response._id,
      username: response.username,
      description: description,
      duration: Number(duration),
      date: dateString,
    });
  } catch (err) {
    return res.status(500).json({ err: "something went wrong" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const user = await User.findById(_id);
    let exercise;
    if (from && to && limit) {
      exercise = user.exercises
        .filter((curr) => {
          if (curr.date >= from && curr.date <= to) {
            return true;
          }
        })
        .splice(0, limit);
    } else {
      exercise = user.exercises;
    }

    let updatedExercises = exercise.map((curr) => {
      let updatedDate = new Date(curr.date).toDateString();
      return {
        description: curr.description,
        duration: curr.duration,
        date: updatedDate,
      };
    });
    if (user) {
      return res.json({
        _id,
        username: user.username,
        count: user.exercises.length,
        log: updatedExercises,
      });
    } else {
      return res.json({
        err: "user not exist",
      });
    }
  } catch (err) {
    return res.json({
      err: "something went wrong",
    });
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
