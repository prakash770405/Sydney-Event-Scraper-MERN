import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
  };

  const importEvent = async (id) => {
    await api.post(`/events/import/${id}`);
    loadEvents();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard – All Event Data</h2>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>City</th>
            <th>Source</th>
            <th>Status</th>
            <th>Last Scraped</th>
            <th>Imported At</th>
            <th>Imported By</th>
            <th>Original URL</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {events.map(event => (
            <tr key={event._id}>
              {/* _id (short) */}
              <td>{event._id.slice(-6)}</td>

              {/* title */}
              <td>{event.title}</td>

              {/* city */}
              <td>{event.city}</td>

              {/* source */}
              <td>{event.source}</td>

              {/* status */}
              <td>
                <span
                  style={{
                    padding: "3px 6px",
                    borderRadius: "4px",
                    background:
                      event.status === "imported" ? "#c8e6c9" : "#ffe0b2"
                  }}
                >
                  {event.status}
                </span>
              </td>

              {/* lastScrapedAt */}
              <td>{formatDate(event.lastScrapedAt)}</td>

              {/* importedAt */}
              <td>{formatDate(event.importedAt)}</td>

              {/* importedBy */}
              <td>{event.importedBy || "-"}</td>

              {/* originalUrl */}
              <td>
                <a
                  href={event.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </td>

              {/* action */}
              <td>
                {event.status === "new" && (
                  <button onClick={() => importEvent(event._id)}>
                    Import
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
