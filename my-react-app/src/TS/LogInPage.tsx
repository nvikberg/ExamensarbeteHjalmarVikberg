import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Data/firebase"; // Import Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import Register from "./Register";
import styles from '../CSS/Login.module.css';
import GoogleLogin from "./GoogleLogin";
import SeasonalPhoto from "./API";

// 25/12 jag la till toggle mellan login och registering.. bråkat med css på register sidan för det bir lite dubblett, måste fixas sen
// Det ser inte så bra ut men logiken fungerar :)

const LogIn: React.FC = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false); //trackar vilken form (login el register)

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      // alert('Welcome welcome ' + email); 
      navigate("/homepage"); // Redirect to homepage on successful login
    } catch (err: any) {
      setError(err.message); // Display error message
    } finally {
      setLoading(false);
    }
  };


  
  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className={styles.main}style={{
      backgroundImage: backgroundImage ? `url("${encodeURI(backgroundImage)}")` : 'none',
    }} >
      <SeasonalPhoto onPhotoFetched={setBackgroundImage} />

    <div className={styles.loginContainer}>
      {isRegistering ? (
        <Register></Register>

      ) : (
        <>
      <form onSubmit={handleLogin}>
<h1>Login</h1>
      <div className={styles.formGroup}>
      <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
        <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="errorMessage">{error}</p>}
        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        <GoogleLogin></GoogleLogin>
      </form>
      <p>
        Don't have an account? <br></br>
        <button onClick={toggleForm} className={styles.loginButton}>Sign up</button>
      </p>
      </>
    )}

{isRegistering && (
          <p>
            Already have an account?{" "}
            <button onClick={toggleForm}>Log in</button>
          </p>
)}

    </div>
    </div>
  );
};

export default LogIn;
