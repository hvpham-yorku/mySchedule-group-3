//the following file is the backend segment of the code 

//these are the following dependancies that are needed as part of the backend with the most notable one being mongoose with is used by the database mongodb
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
// Start the server
const PORT = 6001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// the connectino to the mongodb website
mongoose.connect("mongodb+srv://myScheduleUsername:mySchedulePassword@myschedulecluster.hoiyb.mongodb.net/?retryWrites=true&w=majority&appName=myScheduleCluster", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//here is how the tasks are defined as by the database
const taskSchema = new mongoose.Schema({
  title: String,
  notes: String,
  dueDate: String,
  priority: String,
  completed: Boolean,
});

const Task = mongoose.model("Task", taskSchema);

// we get all the tasks through the api tasks 
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// from here we add a new task
app.post("/api/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.status(201).json(newTask);
});

// here is where we Update a task
app.put("/api/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
});

// and so on Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
