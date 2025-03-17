import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month"); // Ensure views change

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: moment(task.dueDate).toDate(), // Ensure correct date format
    end: moment(task.dueDate).toDate(),
    allDay: true,
  }));

  return (
    <div style={{ height: "500px" }}>
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
      />
    </div>
  );
};

export default MyCalendar;
