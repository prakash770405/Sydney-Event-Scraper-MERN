import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        // Redirect to home
        navigate("/");
      }
    };

    performLogout();
  }, [navigate, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Logging out...</h2>
        <p className="text-gray-600 mt-2">Please wait.</p>
      </div>
    </div>
  );
}

export default Logout;
