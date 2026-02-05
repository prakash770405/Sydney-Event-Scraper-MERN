import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events")
      .then(res => setEvents(res.data));
  }, []);

  const importEvent = async (id) => {
    await api.post(`/events/import/${id}`);
    alert("Event imported");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => (
            <tr key={e._id}>
              <td>{e.title}</td>
              <td>{e.status}</td>
              <td>
                <button onClick={() => importEvent(e._id)}>
                  Import
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
