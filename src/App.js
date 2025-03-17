import React, { useState, useEffect } from "react";
import "./App.css";
import MyCalendar from "./Calendar"; // Import the Calendar component

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium"); // Default priority

  // Function to add a new task
  const addTask = () => {
    if (title.trim() !== "" && dueDate.trim() !== "") {
      const newTask = {
        id: Date.now(),
        title,
        notes,
        dueDate: new Date(dueDate).toISOString(), // Ensure valid date format
        priority,
        completed: false,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setTitle("");
      setNotes("");
      setDueDate("");
      setPriority("Medium"); // Reset priority to default
    } else {
      alert("Please enter a title and due date for the task.");
    }
  };

  // Function to toggle task completion
  const toggleCompletion = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Function to delete a task
  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
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
          toggleCompletion(task.id);
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
            <button onClick={addTask}>Add Task</button>
          </div>
          {/* Sorting Buttons */}
          <div className="sort-buttons">
            <button onClick={sortByPriority}>Sort by Priority</button>
            <button onClick={sortByDueDate}>Sort by Due Date</button>
          </div>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
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
                  <button onClick={() => toggleCompletion(task.id)}>
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
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
