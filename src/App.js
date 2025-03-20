import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import "./App.css";
import MyCalendar from "./Calendar"; // Import the Calendar component

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium"); // Default priority
  const [filterStatus, setFilterStatus] = useState("All"); // Filter by status
  const [editingTask, setEditingTask] = useState(null); // Task being edited

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Function to add a new task
  const addTask = async () => {
    if (title.trim() !== "" && dueDate.trim() !== "") {
      const newTask = {
        title,
        notes,
        dueDate: new Date(dueDate).toISOString(), // Ensure valid date format
        priority,
        completed: false,
      };
      try {
        const response = await axios.post("http://localhost:5000/api/tasks", newTask);
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setTitle("");
        setNotes("");
        setDueDate("");
        setPriority("Medium"); // Reset priority to default
      } catch (error) {
        console.error("Error adding task:", error);
      }
    } else {
      alert("Please enter a title and due date for the task.");
    }
  };

  // Function to toggle task completion
  const toggleCompletion = async (id) => {
    try {
      const task = tasks.find((task) => task._id === id);
      const updatedTask = { ...task, completed: !task.completed };
      await axios.put(`http://localhost:5000/api/tasks/${id}`, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Function to edit a task
  const editTask = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setNotes(task.notes);
    setDueDate(task.dueDate.slice(0, 16)); // Convert ISO date to datetime-local format
    setPriority(task.priority);
  };

  // Function to save edited task
  const saveEditedTask = async () => {
    if (title.trim() !== "" && dueDate.trim() !== "") {
      const updatedTask = {
        ...editingTask,
        title,
        notes,
        dueDate: new Date(dueDate).toISOString(),
        priority,
      };
      try {
        await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, updatedTask);
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
        );
        setEditingTask(null);
        setTitle("");
        setNotes("");
        setDueDate("");
        setPriority("Medium");
      } catch (error) {
        console.error("Error saving edited task:", error);
      }
    } else {
      alert("Please enter a title and due date for the task.");
    }
  };

  // Function to sort tasks by priority
  const sortByPriority = () => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    setTasks((prevTasks) =>
      [...prevTasks].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      )
    );
  };

  // Function to sort tasks by due date
  const sortByDueDate = () => {
    setTasks((prevTasks) =>
      [...prevTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    );
  };

  // Filter tasks by status
  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Completed") return task.completed;
    if (filterStatus === "Incomplete") return !task.completed;
    return true;
  });

  // Check for due tasks and trigger notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (now >= dueDate && !task.completed) {
          // Trigger notification
          if (Notification.permission === "granted") {
            new Notification(`Task Due: ${task.title}`, {
              body: `It's time for: ${task.title}`,
            });

            // Play sound
            const audio = new Audio("/notification.mp3"); // Path to your sound file
            audio.play();
          }

          // Mark the task as completed
          toggleCompletion(task._id);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [tasks]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="App">
      <h1>MySchedule</h1>
      <div className="split-layout">
        {/* Left Side: To-Do List */}
        <div className="todo-list">
          <div className="input-container">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
            />
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            {editingTask ? (
              <>
                <button onClick={saveEditedTask}>Save Changes</button>
                <button onClick={() => setEditingTask(null)}>Cancel</button>
              </>
            ) : (
              <button onClick={addTask}>Add Task</button>
            )}
          </div>
          {/* Sorting and Filtering Buttons */}
          <div className="sort-buttons">
            <button onClick={sortByPriority}>Sort by Priority</button>
            <button onClick={sortByDueDate}>Sort by Due Date</button>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li key={task._id} className={task.completed ? "completed" : ""}>
                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.notes && <p>{task.notes}</p>}
                  <p>Due: {new Date(task.dueDate).toLocaleString()}</p>
                  <p>
                    Priority:{" "}
                    <span className={`priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </p>
                </div>
                <div className="task-actions">
                  <button onClick={() => toggleCompletion(task._id)}>
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button onClick={() => editTask(task)}>Edit</button>
                  <button onClick={() => deleteTask(task._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Calendar */}
        <div className="calendar-view">
          <MyCalendar tasks={tasks} />
        </div>
      </div>
    </div>
  );
}

export default App;