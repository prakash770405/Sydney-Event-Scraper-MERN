import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Transition } from "@headlessui/react"; // For smooth mobile menu
import api from "../services/api"; // make sure your api has auth token interceptor

function Navbar() {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapingError, setScrapingError] = useState("");

  if (loading) return null;

  const triggerScraper = async () => {
    if (!window.confirm("Are you sure you want to scrape Sydney events? This may take a few minutes...")) return;

    try {
      setScrapingError("");
      setScraping(true);
      console.log("Starting scraper...");
      const res = await api.post("/admin/scrape-sydney");
      console.log("Scraper response:", res.data);
      alert(`✅ ${res.data.message}`);
    } catch (err) {
      console.error("Scraper error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to run scraper";
      setScrapingError(errorMsg);
      alert(`❌ Scraper Error:\n${errorMsg}`);
    } finally {
      setScraping(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Sydney_Event_Scrapper
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-indigo-600">
              Home
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Admin_Dashboard
                </Link>
                {/* Scraper button for admins */}
                <button
                  onClick={triggerScraper}
                  disabled={scraping}
                  className={`px-3 py-1 rounded text-white transition ${
                    scraping ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                  title={scraping ? "Scraping in progress..." : "Click to scrape Sydney events from Eventbrite"}
                >
                  {scraping ? "⏳ Scraping..." : "🕷️ Scrape Events"}
                </button>
                <span className="font-semibold text-gray-800">👋 {user.name}</span>
              </>
            )}

            {!user ? (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
              >
                Admin Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-200 transform"
        enterFrom="-translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-150 transform"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-2 opacity-0"
      >
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white shadow-md">
          <Link to="/" className="block text-gray-700 hover:text-indigo-600">
            Home
          </Link>

          {user && (
            <>
              <Link to="/dashboard" className="block text-gray-700 hover:text-indigo-600">
                Admin
              </Link>

              <button
                onClick={triggerScraper}
                disabled={scraping}
                className={`block w-full text-left px-3 py-1 rounded text-white transition ${
                  scraping ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {scraping ? "⏳ Scraping..." : "🕷️ Scrape Events"}
              </button>

              <span className="block font-semibold text-gray-800">👋 {user.name}</span>
            </>
          )}

          {!user ? (
            <Link
              to="/login"
              className="block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
            >
              Admin Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="block w-full text-left bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;
