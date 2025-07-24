import { useEffect, useState } from "react";
import { useToDo } from "../context/ToDoContext";

export default function RightSidebar() {
  const { tasks } = useToDo();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/appointments/calendar-events`);
      const events = await res.json();
      
      // Filter for upcoming events (next 7 days)
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);
      
      const upcoming = events
        .filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= now && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5); // Show only next 5 events
      
      setUpcomingEvents(upcoming);
    } catch (err) {
      console.error("❌ Failed to load upcoming events:", err);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
    
    // Refresh events every 5 minutes
    const interval = setInterval(fetchUpcomingEvents, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show day and time
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-fit bg-surface border border-border shadow-panel rounded-md p-4 space-y-6 text-text">
      {/* Calendar Section */}
      <div>
        <h2 className="text-xs font-header font-bold uppercase text-accent mb-2 tracking-wide">
          📅 Upcoming Events
        </h2>
        
        {loading ? (
          <p className="text-sm text-muted">Loading events...</p>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted">No upcoming events this week</p>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                className="text-sm border-l-2 border-accent pl-2 py-1 bg-highlight/50 rounded-r"
              >
                <div className="font-medium text-text truncate" title={event.title}>
                  {event.title}
                </div>
                <div className="text-xs text-muted">
                  {formatEventDate(event.start)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border" />

      {/* To-Do Section */}
      <div>
        <h2 className="text-xs font-header font-bold uppercase text-accent mb-2 tracking-wide">
          ✅ To-Do List
        </h2>
        {tasks.filter((t) => !t.done).length === 0 ? (
          <p className="text-sm text-muted">All caught up</p>
        ) : (
          <ul className="space-y-1">
            {tasks
              .filter((task) => !task.done)
              .slice(0, 5)
              .map((task) => (
                <li 
                  key={task.id} 
                  className="text-sm text-text border-l-2 border-accent pl-2 py-0.5 bg-highlight/30 rounded-r"
                  title={task.text}
                >
                  <span className="truncate block">{task.text}</span>
                </li>
              ))}
          </ul>
        )}
        
        {tasks.filter((t) => !t.done).length > 5 && (
          <p className="text-xs text-muted mt-2">
            +{tasks.filter((t) => !t.done).length - 5} more tasks
          </p>
        )}
      </div>
    </div>
  );
}