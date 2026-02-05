import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Transition } from "@headlessui/react"; // Optional for smooth mobile menu

function Navbar() {
  const { user, loading } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-indigo-600">
              MyApp
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-indigo-600">
              Home
            </a>

            {user && (
              <>
                <a href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Admin
                </a>
                <span className="font-semibold text-gray-800">
                  👋 {user.name}
                </span>
              </>
            )}

            {!user ? (
              <a
                href="/login"
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
              >
                Admin Login
              </a>
            ) : (
              <a
                href="/logout"
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </a>
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
          <a href="/" className="block text-gray-700 hover:text-indigo-600">
            Home
          </a>

          {user && (
            <>
              <a
                href="/dashboard"
                className="block text-gray-700 hover:text-indigo-600"
              >
                Admin
              </a>
              <span className="block font-semibold text-gray-800">
                👋 {user.name}
              </span>
            </>
          )}

          {!user ? (
            <a
              href="/login"
              className="block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
            >
              Admin Login
            </a>
          ) : (
            <a
              href="/logout"
              className="block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </a>
          )}
        </div>
      </Transition>
    </nav>
  );
}

export default Navbar;
