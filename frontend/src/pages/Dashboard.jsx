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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Admin Dashboard – All Event Data        
      </h2>

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
                  <a
                    href={event.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </a>
                </td>

                {/* action */}
                <td className="px-4 py-2">
                  {event.status === "new" && (
                    <button
                      onClick={() => importEvent(event._id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                    >
                      Import
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
