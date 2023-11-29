const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/users")
  .then(() => {
    console.log("connection established");
  })
  .catch((error) => console.log(error));

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date,
});

const userSchema = new mongoose.Schema({
  username: String,
  exercises: [exerciseSchema], // Array of exercise documents
});

const User = mongoose.model("User", userSchema);

module.exports = User;
