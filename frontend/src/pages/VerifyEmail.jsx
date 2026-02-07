import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const { leadId, code } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!leadId || !code) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyLead = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/lead/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ leadId, code }),
        });

        const data = await response.json();
        
        if (response.ok) {
          setStatus("success");
          setMessage("Email verified! Redirecting...");
          
          // Redirect to external URL if available, otherwise to home
          const redirectUrl = data.redirectUrl;
          if (redirectUrl) {
            if (redirectUrl.startsWith("http")) {
              // External event URL
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 1500);
            } else {
              // Internal route
              setTimeout(() => {
                navigate(redirectUrl);
              }, 1500);
            }
          } else {
            // No redirect URL provided, go to home
            setTimeout(() => {
              navigate("/");
            }, 1500);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. Please try again.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage("Error verifying email. Please try again.");
      }
    };

    verifyLead();
  }, [leadId, code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md w-full">
        {status === "verifying" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800">{message}</h2>
            <p className="text-center text-gray-600 mt-2">Please wait, you will be redirected shortly.</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="text-4xl">✅</div>
            </div>
            <h2 className="text-xl font-semibold text-center text-green-600">{message}</h2>
            <p className="text-center text-gray-600 mt-2">Redirecting you now...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="text-4xl">❌</div>
            </div>
            <h2 className="text-xl font-semibold text-center text-red-600">{message}</h2>
            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
