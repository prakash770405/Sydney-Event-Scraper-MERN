import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get("/events/public");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getTickets = async (event) => {
    let email = prompt("Enter your Gmail address to get tickets:");

    if (!email) {
      alert("Email is required!");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      alert("Please enter a valid Gmail address!");
      return;
    }

    try {
      await api.post("/events/lead", {
        email,
        eventId: event._id,
        consent: true
      });

      window.open(event.originalUrl, "_blank");
    } catch (err) {
      console.error(err);
      alert("Failed to save email. Try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Sydney Events</h2>

      {events.length === 0 && (
        <p className="text-gray-500">No events available.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {event.title}
              </h3>

              <p className="text-sm text-gray-600">
                <strong>City:</strong> {event.city}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Source:</strong> {event.source}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Imported:</strong> {formatDate(event.importedAt)}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Added by:</strong> {event.importedBy || "Admin"}
              </p>

              <button
                onClick={() => getTickets(event)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                🎟️ Get Tickets
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
