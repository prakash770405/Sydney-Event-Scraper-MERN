import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [importingId, setImportingId] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/events");
      console.log("Events loaded:", res.data);
      setEvents(res.data || []);
    } catch (err) {
      console.error("Failed to load events:", err);
      const errorMsg = err.response?.data?.message || "Failed to load events";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const importEvent = async (id) => {
    if (!user) {
      setError("You must be logged in to import events");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setImportingId(id);
      
      const res = await api.post(`/events/import/${id}`);
      console.log("Import response:", res.data);
      
      setSuccessMessage("Event imported successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Reload events
      await loadEvents();
    } catch (err) {
      console.error("Import error:", err);
      const errorMsg = err.response?.data?.message || "Failed to import event";
      setError(errorMsg);
    } finally {
      setImportingId(null);
    }
  };

  const deleteEvent = async (id) => {
    if (!user) {
      setError("You must be logged in as admin to delete events");
      return;
    }

    if (!window.confirm("Delete this event? This action cannot be undone.")) return;

    try {
      setError("");
      const res = await api.delete(`/admin/events/${id}`);
      setSuccessMessage(res.data.message || "Event deleted");
      setTimeout(() => setSuccessMessage(""), 3000);
      await loadEvents();
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete event";
      setError(errorMsg);
    }
  };

  const deleteAllEvents = async () => {
    if (!user) {
      setError("You must be logged in as admin to delete events");
      return;
    }

    if (!window.confirm("Delete ALL events? This will remove all events from the database.")) return;

    try {
      setError("");
      const res = await api.delete(`/admin/events`);
      setSuccessMessage(res.data.message || "All events deleted");
      setTimeout(() => setSuccessMessage(""), 4000);
      await loadEvents();
    } catch (err) {
      console.error("Delete all error:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete events";
      setError(errorMsg);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Admin Dashboard – All Event Data        
        </h2>
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={deleteAllEvents}
              className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700"
            >
              Delete All
            </button>
          )}
          <button
            onClick={loadEvents}
            disabled={loading}
            className={`px-4 py-2 rounded text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError("")}
            className="text-red-700 font-bold hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage("")}
            className="text-green-700 font-bold hover:text-green-900"
          >
            ✕
          </button>
        </div>
      )}

      {!user && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Please log in as admin to import events.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded">
          <p className="text-gray-600">No events found. Try scraping Sydney events first.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 shadow-sm rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {[
                "ID",
                "Title",
                "City",
                "Source",
                "Status",
                "Last Scraped",
                "Imported At",
                "Imported By",
                "Original URL",
                "Action",
              ].map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                {/* _id (short) */}
                <td className="px-4 py-2 text-sm text-gray-600">
                  {event._id.slice(-6)}
                </td>

                {/* title */}
                <td className="px-4 py-2 text-sm text-gray-700">{event.title}</td>

                {/* city */}
                <td className="px-4 py-2 text-sm text-gray-700">{event.city}</td>

                {/* source */}
                <td className="px-4 py-2 text-sm text-gray-700">{event.source}</td>

                {/* status */}
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === "imported"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </td>

                {/* lastScrapedAt */}
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDate(event.lastScrapedAt)}
                </td>

                {/* importedAt */}
                <td className="px-4 py-2 text-sm text-gray-600">
                  {formatDate(event.importedAt)}
                </td>

                {/* importedBy */}
                <td className="px-4 py-2 text-sm text-gray-700">
                  {event.importedBy || "-"}
                </td>

                {/* originalUrl */}
                <td className="px-4 py-2">
                  {event.originalUrl ? (
                    <a
                      href={event.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">No URL</span>
                  )}
                </td>

                {/* action */}
                <td className="px-4 py-2 flex items-center gap-2">
                  {event.status === "new" && (
                    <button
                      onClick={() => importEvent(event._id)}
                      disabled={!user || importingId === event._id}
                      className={`px-3 py-1 text-sm rounded transition ${
                        user && importingId !== event._id
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {importingId === event._id ? "Importing..." : "Import"}
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
