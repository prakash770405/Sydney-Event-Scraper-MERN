function Login() {
  const login = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
        
        <button
          onClick={login}
          className="flex items-center justify-center w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded shadow transition duration-200"
        >
          {/* Google Icon (optional) */}
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.7-1.5-35-4.4-51.8H272v98.1h146.9c-6.3 33.8-25 62.4-53.4 81.6v67.6h86.4c50.7-46.7 80-115.4 80-195.5z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c72.6 0 133.6-24.1 178.2-65.3l-86.4-67.6c-24 16-54.6 25.5-91.8 25.5-70.6 0-130.3-47.7-151.7-111.7H34.2v70.2C78.8 483.3 168.7 544.3 272 544.3z"
              fill="#34A853"
            />
            <path
              d="M120.3 323.1c-5.8-17.5-9.1-36.1-9.1-55.1s3.3-37.6 9.1-55.1v-70.2H34.2C12.3 178.4 0 223.1 0 272s12.3 93.6 34.2 124.2l86.1-73.1z"
              fill="#FBBC05"
            />
            <path
              d="M272 107.7c37.5 0 71.1 12.9 97.5 34.1l73.1-73.1C405.6 24.1 344.6 0 272 0 168.7 0 78.8 61 34.2 152.5l86.1 70.2c21.4-64 81.1-111.7 151.7-111.7z"
              fill="#EA4335"
            />
          </svg>

          Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
