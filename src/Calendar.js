//same imports like the app.js except it will be using the calender from react in addition 

import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

//getting the tasks 
const fetchTasks = async () => {
  const response = await fetch("http://localhost:6001/api/tasks");
  const data = await response.json();
  console.log(data);
};

//defining the tasks in the calender 
const MyCalendar = ({ tasks, pinnedTasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month"); // Ensure views change

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.pinned ? `📌 ${task.title}` : task.title,
    start: moment(task.dueDate).toDate(), // Ensure correct date format
    end: moment(task.dueDate).toDate(),
    allDay: true,
    priority: task.priority  
  }));

   // Custom event component to show pin indicator
   const EventComponent = ({ event }) => (
    <div>
      {event.pinned && "📌 "}
      {event.title}
    </div>
  );
  
  
  //the styling of the calender used by the css file
  
  return (
    <div style={{ height: "500px", position: "relative" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={currentView} // Controlled view state
        onView={(newView) => setCurrentView(newView)} // Allow view switching
        views={{ month: true, week: true, day: true }} // Use object format
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        onSelectEvent={(event) => alert(`Selected: ${event.title}`)}
        components={{
          event: EventComponent  // Use custom event component
        }}
      />
      
      {/* Pinned tasks section at bottom */}
      {pinnedTasks && pinnedTasks.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#f8f9fa",
          padding: "10px",
          borderTop: "1px solid #ddd",
          zIndex: 100
        }}>
          <h4 style={{ margin: "0 0 10px 0" }}>📌 Pinned Tasks</h4>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
            {pinnedTasks.map(task => (
              <div key={task._id} style={{
                minWidth: "200px",
                padding: "8px",
                background: "white",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ fontWeight: "bold" }}>{task.title}</div>
                <div>Due: {moment(task.dueDate).format("MMM D, h:mm a")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
