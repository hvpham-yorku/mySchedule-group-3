const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Connect to MongoDB
mongoose.connect("mongodb+srv://myScheduleUsername:mySchedulePassword@myschedulecluster.hoiyb.mongodb.net/?retryWrites=true&w=majority&appName=myScheduleCluster", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Task Schema
const taskSchema = new mongoose.Schema({
  title: String,
  notes: String,
  dueDate: String,
  priority: String,
  completed: Boolean,
});

const Task = mongoose.model("Task", taskSchema);

// API Routes
// Get all tasks
app.get("/api/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.status(201).json(newTask);
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});