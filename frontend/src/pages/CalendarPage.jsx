import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar-overrides.css";
import CreateAppointmentModal from "../components/CreateAppointmentModal";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointments/calendar-events`);
      const crmData = await res.json();
      const crmEvents = crmData.map((evt) => ({
        ...evt,
        start: new Date(evt.start),
        end: new Date(evt.end),
        source: "crm",
      }));
      setAppointments(crmEvents);
    } catch (err) {
      console.error("❌ Failed to load calendar events:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!createModalOpen) {
      fetchAppointments();
    }
  }, [createModalOpen]);

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedEvent(null), 200);
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmed) return;

    try {
      const rawId = selectedEvent.id.startsWith("appt-")
        ? selectedEvent.id.replace("appt-", "")
        : selectedEvent.id;

      const deleteUrl = `${API_URL}/api/appointments/${rawId}`;
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      console.log(`🗑️ Deleted appointment ${rawId}`);
      fetchAppointments();
      closeModal();
    } catch (err) {
      console.error("❌ Failed to delete appointment:", err);
    }
  };

  const navigate = (direction) => {
    const newDate = moment(date)[direction](1, "month").toDate();
    setDate(newDate);
  };

  const handleDateClick = ({ start }) => {
    if (submitting) return;
    setClickedDate(start);
    setCreateModalOpen(true);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: "#991b1b",
        color: "white",
        borderRadius: "5px",
        padding: "4px",
        zIndex: 2,
      },
    };
  };

  return (
    <div className="p-4 md:p-6 bg-background text-text min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold">📅 Calendar</h2>
        <button
          onClick={() => {
            setClickedDate(null);
            setCreateModalOpen(true);
          }}
          className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
        >
          + Create Appointment
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 z-10 relative">
        <button onClick={() => navigate("subtract")} className="calendar-btn">◀ Prev</button>
        <button onClick={() => setDate(new Date())} className="calendar-btn">⏺ Today</button>
        <button onClick={() => navigate("add")} className="calendar-btn">Next ▶</button>

        {["month", "week", "day"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`calendar-btn ${view === v ? "bg-red-700" : "bg-accent"}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="border border-border p-2 rounded shadow bg-surface z-0 relative">
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
          selectable
          onSelectEvent={openModal}
          onSelectSlot={handleDateClick}
          popup
          style={{ height: 750 }}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {selectedEvent && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[999] transition-opacity duration-200 ${
            modalVisible ? "opacity-100 bg-black/70" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-surface p-6 rounded-lg shadow-lg w-[90%] max-w-md border border-border text-text transform transition-all duration-300 scale-100 z-[1000]">
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-accent text-white rounded hover:bg-red-700"
              >
                Close
              </button>

              {selectedEvent.source === "crm" && (
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateAppointmentModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSubmitting(false);
        }}
        prefillDate={clickedDate}
        setSubmitting={setSubmitting}
      />
    </div>
  );
}
