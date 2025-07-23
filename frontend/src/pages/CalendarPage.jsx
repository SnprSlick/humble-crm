import React, { useEffect, useState, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar-overrides.css";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    fetch(`${API_URL}/api/google-calendar/events`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        const rawEvents = data?.events || [];
        const converted = rawEvents.map((evt) => {
          const startRaw = evt.start?.dateTime || evt.start?.date;
          const endRaw = evt.end?.dateTime || evt.end?.date || startRaw;
          return {
            id: evt.id,
            title: evt.summary || "Untitled",
            start: new Date(startRaw),
            end: new Date(endRaw),
            tooltip: evt.description || "",
            location: evt.location || "",
            description: evt.description || "",
          };
        });

        if (converted.length === 0) {
          converted.push({
            id: "fallback",
            title: "Google Fallback Event",
            start: new Date(),
            end: new Date(Date.now() + 60 * 60 * 1000),
            tooltip: "Generated to test event render",
          });
        }

        setAppointments(converted);
      })
      .catch((err) => console.error("Failed to fetch calendar events:", err));
  }, []);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const navigate = (direction) => {
    const newDate = moment(date)[direction](1, "month").toDate();
    setDate(newDate);
  };

  return (
    <div className="p-6 bg-background text-text min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📅 Calendar</h2>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => navigate("subtract")} className="calendar-btn">◀ Prev</button>
        <button onClick={() => setDate(new Date())} className="calendar-btn">⏺ Today</button>
        <button onClick={() => navigate("add")} className="calendar-btn">Next ▶</button>

        {["month", "week", "day"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`calendar-btn ${
              view === v ? "bg-red-700" : "bg-accent"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="border border-border p-2 rounded shadow bg-surface">
        <Calendar
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          tooltipAccessor="tooltip"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          popup
          style={{ height: 750 }}
          onSelectEvent={openModal}
        />
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${
            modalVisible ? "opacity-100 bg-black/70" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-surface p-6 rounded-lg shadow-lg w-[90%] max-w-md border border-border text-text transform transition-all duration-300 scale-100">
            <h3 className="text-xl font-semibold mb-3 border-b border-border pb-2">
              {selectedEvent.title}
            </h3>

            <div className="text-sm space-y-2">
              <div>
                <span className="text-muted font-semibold">Start:</span>{" "}
                {selectedEvent.start.toLocaleString()}
              </div>
              <div>
                <span className="text-muted font-semibold">End:</span>{" "}
                {selectedEvent.end.toLocaleString()}
              </div>
              {selectedEvent.location && (
                <div>
                  <span className="text-muted font-semibold">Location:</span>{" "}
                  {selectedEvent.location}
                </div>
              )}
              {selectedEvent.description && (
                <div className="mt-4 border border-border rounded p-3 bg-surface-dark">
                  <div className="text-accent font-semibold mb-1">📝 Notes</div>
                  <div className="whitespace-pre-line text-muted text-sm leading-snug">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={closeModal}
              className="mt-6 px-4 py-2 bg-accent text-white rounded hover:bg-red-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
