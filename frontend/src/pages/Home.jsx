import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const res = await api.get("/events/public");
    setEvents(res.data);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sydney Events</h2>

      {events.length === 0 && <p>No events available.</p>}

      <div style={{ display: "grid", gap: "15px" }}>
        {events.map(event => (
          <div
            key={event._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "6px"
            }}
          >
            <h3>{event.title}</h3>

            <p><strong>City:</strong> {event.city}</p>
            <p><strong>Source:</strong> {event.source}</p>
            <p>
              <strong>Imported:</strong>{" "}
              {formatDate(event.importedAt)}
            </p>
            <p>
              <strong>Added by:</strong>{" "}
              {event.importedBy || "Admin"}
            </p>

            <a
              href={event.originalUrl}
              target="_blank"
              rel="noreferrer"
            >
              🎟️ Get Tickets
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
