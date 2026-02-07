import { useEffect, useState } from "react";
import api from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setPageLoading(true);
      setError("");
      const res = await api.get("/events/public");
      // Sort with images first, then by import date
      const sorted = (res.data || []).sort((a, b) => {
        if (a.image && !b.image) return -1;
        if (!a.image && b.image) return 1;
        return new Date(b.importedAt) - new Date(a.importedAt);
      });
      setEvents(sorted);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to load events. Please refresh the page.");
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const isExpired = (date) => {
    if (!date) return false;
    try {
      return new Date(date) < new Date();
    } catch {
      return false;
    }
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

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
            Discover Events in Sydney
          </h1>
          <p className="text-slate-600 text-lg">Explore curated events happening around you</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events by name..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
          </div>
          <button
            onClick={() => {}}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-md whitespace-nowrap"
          >
            🔍 Search
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex justify-between items-center">
            <span className="font-medium">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {pageLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500 mb-2">No events found</p>
            <p className="text-slate-400">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for more events!"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-slate-600">
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-56 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                        🎉
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isExpired(event.dateTime) ? (
                        <span className="px-3 py-1 text-xs font-semibold bg-red-500 text-white rounded-full shadow-md">
                          Expired
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold bg-green-500 text-white rounded-full shadow-md">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="text-xs text-slate-500 space-y-2 mb-4 flex-1">
                      <p>
                        <span className="font-semibold text-gray-700">📍 Location:</span> {event.city}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">📅 Imported:</span> {formatDate(event.importedAt)}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => getTickets(event)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                        loading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
                      }`}
                    >
                      {loading ? "Processing..." : "🎟️ Get Tickets"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
