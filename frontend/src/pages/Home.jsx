import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setError("");
      const res = await api.get("/events/public");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to load events. Please refresh the page.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getTickets = async (event) => {
    let email = prompt("Enter your email address to get tickets:");

    if (!email) {
      alert("Email is required!");
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Create lead & send verification email
      const leadRes = await api.post("/lead/submit", {
        name: "Guest",
        email,
        eventId: event._id,
        consent: true,
      });

      const leadId = leadRes.data.leadId;
      
      // Check if already verified
      if (leadRes.data.redirectUrl) {
        window.location.href = leadRes.data.redirectUrl;
        return;
      }

      alert("A verification link has been sent to your email. Click the link to complete your ticket registration.");
      
      // Optionally ask for code if email link fails
      const useCode = prompt("Or enter the 4-digit code that was sent to your email (optional):");

      if (useCode && useCode.length === 4) {
        // Verify the code
        const verifyRes = await api.post("/lead/verify", { 
          leadId, 
          code: useCode 
        });

        if (verifyRes.data.redirectUrl) {
          window.location.href = verifyRes.data.redirectUrl;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to process tickets. Try again.";
      setError(errorMsg);
      alert(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">All Events In Sydney</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-4 text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {events.length === 0 && <p className="text-gray-500">No events available.</p>}

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
                disabled={loading}
                className={`w-full px-4 py-2 rounded text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Processing..." : "🎟️ Get Tickets"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
