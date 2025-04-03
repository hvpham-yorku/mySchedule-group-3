/*NOTE: The main files that are used and are important for application purposes is App.js and server.js, which are the bulk 
of the logic and code that is used, the css files, packages, node modules, and any other files beyond the main two will not
be as heavily commented since it is unneeded, irrelvant, and easy to understand without commenting. As a result, these two
files will have the majority of the comments and docummentation needed.
*/

// There are various dependencies that the application uses and we have to import some of them here as part of the front end working as needed 
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import "./App.css";
import MyCalendar from "./Calendar"; // Import the Calendar component

// Define the constant port
const API_PORT = 6001; //using the port 6001 for no errors for non windows systems
const API_BASE_URL = `http://localhost:${API_PORT}`; // Base URL for API calls

// Constructor
function App() {
  // Fields and values that the functions have
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium"); // Default priority
  const [filterStatus, setFilterStatus] = useState("All"); // Filter by status
  const [editingTask, setEditingTask] = useState(null); // Task being edited
  const [searchQuery, setSearchQuery] = useState(""); // Search query for tasks
  const [reminderTime, setReminderTime] = useState("0"); // Reminder time before due date
  const [activeReminders, setActiveReminders] = useState({}); // Track active reminders

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Using the axios package to get the tasks on the backend
        const response = await axios.get(`${API_BASE_URL}/api/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Function to show notification
  const showNotification = (task) => {
    if (Notification.permission === "granted") {
      new Notification(`Reminder: ${task.title}`, {
        body: `Your task "${task.title}" is due soon!`,
        icon: "/favicon.ico"
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(`Reminder: ${task.title}`, {
            body: `Your task "${task.title}" is due soon!`,
            icon: "/favicon.ico"
          });
        }
      });
    }
  };

  // Function to set up reminders for tasks
  useEffect(() => {
    // Clear all existing reminders
    Object.values(activeReminders).forEach(clearTimeout);
    setActiveReminders({});

    // Set up new reminders for tasks that have them
    tasks.forEach(task => {
      if (task.reminderTime && task.reminderTime !== "0" && !task.completed) {
        const dueDate = new Date(task.dueDate);
        const reminderTimeMs = parseInt(task.reminderTime) * 60 * 1000; // Convert minutes to ms
        const reminderTime = new Date(dueDate.getTime() - reminderTimeMs);
        
        const now = new Date();
        if (reminderTime > now) {
          const timeoutId = setTimeout(() => {
            showNotification(task);
          }, reminderTime - now);
          
          setActiveReminders(prev => ({
            ...prev,
            [task._id]: timeoutId
          }));
        }
      }
    });

    // Cleanup function to clear timeouts when component unmounts
    return () => {
      Object.values(activeReminders).forEach(clearTimeout);
    };
  }, [tasks]);

  // Function to add a new task
  const addTask = async () => {
    if (title.trim() !== "" && dueDate.trim() !== "") {
      const newTask = {
        title,
        notes,
        dueDate: new Date(dueDate).toISOString(), // Ensure valid date format
        priority,
        completed: false,
        pinned: false,
        reminderTime: reminderTime
      };

      try {
        const response = await axios.post(`${API_BASE_URL}/api/tasks`, newTask);
        setTasks((prevTasks) => [...prevTasks, response.data]);
        setTitle("");
        setNotes("");
        setDueDate("");
        setPriority("Medium"); // Reset priority to default
        setReminderTime("0"); // Reset reminder time to default
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
      await axios.put(`${API_BASE_URL}/api/tasks/${id}`, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );
      
      // Clear reminder if task is completed
      if (updatedTask.completed && activeReminders[id]) {
        clearTimeout(activeReminders[id]);
        setActiveReminders(prev => {
          const newReminders = {...prev};
          delete newReminders[id];
          return newReminders;
        });
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      // Finding the id of the task
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      
      // Clear reminder if exists
      if (activeReminders[id]) {
        clearTimeout(activeReminders[id]);
        setActiveReminders(prev => {
          const newReminders = {...prev};
          delete newReminders[id];
          return newReminders;
        });
      }
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
    setReminderTime(task.reminderTime || "0");
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
        reminderTime
      };
      try {
        await axios.put(`${API_BASE_URL}/api/tasks/${editingTask._id}`, updatedTask);
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
        );
        setEditingTask(null);
        setTitle("");
        setNotes("");
        setDueDate("");
        setPriority("Medium");
        setReminderTime("0");
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

  // Calculate task progress statistics
  const calculateProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      completionPercentage
    };
  };

  // Filter tasks by status and search query
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filterStatus === "Completed" && !task.completed) return false;
    if (filterStatus === "Incomplete" && task.completed) return false;
    
    // Filter by search query
    if (searchQuery && 
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.notes.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Add toggle pin function
  const togglePin = async (id) => {
    try {
      const task = tasks.find((task) => task._id === id);
      const updatedTask = { ...task, pinned: !task.pinned };
      await axios.put(`${API_BASE_URL}/api/tasks/${id}`, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error toggling task pin:", error);
    }
  };

  // The following is the styling that is used by the css file to format the page
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
            <select
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            >
              <option value="0">No reminder</option>
              <option value="1">1 minute before</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
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
          
          {/* Progress Bar */}
          <div className="progress-container">
            <h3>Task Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress().completionPercentage}%` }}
              ></div>
            </div>
            <p>
              {calculateProgress().completedTasks} of {calculateProgress().totalTasks} tasks completed (
              {calculateProgress().completionPercentage}%)
            </p>
          </div>
          
          {/* Sorting, Filtering and Search */}
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
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="search-input"
            />
          </div>
           {/* Underneath the calender, the task list */}
        <ul className="task-list">
        {filteredTasks.map((task) => (
          <li 
            key={task._id} 
            className={`${task.completed ? "completed" : ""} ${task.pinned ? "pinned" : ""}`}
          >
            {task.pinned && <span className="bookmark-icon">📌</span>}
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
              {task.reminderTime && task.reminderTime !== "0" && (
                <p className="reminder-info">
                  Reminder: {task.reminderTime} minute(s) before due
                </p>
              )}
            </div>
            <div className="task-actions">
              <button onClick={() => togglePin(task._id)}>
                {task.pinned ? "Unpin" : "Pin"}
              </button>
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
        
         {/* Right Side: Calendar and Pinned Tasks */}
        <div className="right-panel">
          <div className="calendar-view">
            <MyCalendar tasks={tasks} />
          </div>
          <div className="pinned-tasks-sidebar">
            <h3>📌 Pinned Tasks</h3>
            {tasks.filter(task => task.pinned).length > 0 ? (
              <ul className="pinned-tasks-list">
                {tasks.filter(task => task.pinned).map(task => (
                  <li key={task._id} className="pinned-task">
                    <div className="pinned-task-content">
                      <h4>{task.title}</h4>
                      <p>Due: {new Date(task.dueDate).toLocaleString()}</p>
                      <p className={`priority-${task.priority.toLowerCase()}`}>
                        {task.priority} priority
                      </p>
                      {task.reminderTime && task.reminderTime !== "0" && (
                        <p className="reminder-info">
                          Reminder: {task.reminderTime} minute(s) before
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => togglePin(task._id)}
                      className="unpin-button"
                    >
                      Unpin
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pinned tasks</p>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;