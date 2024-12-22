import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Data/firebase"; // Import Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import "../CSS/login.css";

const LogIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/homepage"); // Redirect to homepage on successful login
    } catch (err: any) {
      setError(err.message); // Display error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
    <div className="login-container">
      <h1>Log In</h1>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
    </div>
  );
};

export default LogIn;
