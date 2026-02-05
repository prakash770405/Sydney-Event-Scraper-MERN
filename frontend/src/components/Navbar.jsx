import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <a href="/">Home</a>

      {user && (
        <>
          {" | "}
          <a href="/dashboard">Admin</a>
          {" | "}
          <span style={{ fontWeight: "bold" }}>
            👋 {user.name}
          </span>
        </>
      )}

      {" | "}

      {!user ? (
        <a href="/login">Login</a>
      ) : (
        <a href="/logout">Logout</a>
      )}
    </nav>
  );
}

export default Navbar;
