import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { db } from '../Data/firebase'; 
import React from 'react';
import styles from '../CSS/Login.module.css';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<string>('user');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  //ps. loading används för att förhindra att man skickar datan flera gånger (tx klickar på knappen flera gånger), + bättre för användarvänligheten

  //skapa nya användare i authentication, och lägger till datan till databasen också,

  const auth = getAuth();
  const navigate = useNavigate();

  //Ny Användare registreras
  const registerNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 

    if (!email.trim() || !password.trim()) {
      setError('Please enter a valid email and password!');
      setLoading(false);
      return;
    }

    try {
      //Skapar en användare med firebase authentiication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //lägger till användaren i vår firestore databas
      const firestore = getFirestore();
      const docRef = await addDoc(collection(db, 'Users'), {
        firstName,
        lastName,
        email,
        status, // kommer alltid vara user just nu 
      });

      setLoading(false); 
      alert('Welcome welcome ' + user.email); 
      console.log('Document written with ID: ', docRef.id);
      navigate('/');
    } catch (error) {
      setLoading(false); 
      console.error('Register Error:', error);
      setError('Error during registration. Please try again!');
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.loginContainer}>
      <h1>Register</h1>
        <form onSubmit={registerNewUser}>

          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="errorMessage">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* <p>
          Already have an account? <a href="/login">Log in</a>
        </p> */}
      </div>
 </div>
  );
};

export default Register;
