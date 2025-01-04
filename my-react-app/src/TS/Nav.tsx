import { Link } from 'react-router-dom';
import React from 'react';
import styles from '../CSS/Nav.module.css';
import FetchBoard from './FetchBoards';
import Logout from './Logout';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged} from 'firebase/auth';
import NavIcons from './NavIcons';

const Nav: React.FC<{}> = () => {

  //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
const [user, setUser] = useState<any>('');
const auth = getAuth();

useEffect(() => {
  // Listen for changes in the user's authentication state
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      // User is logged in
      setUser(currentUser);
    } else {
      // User is logged out
      setUser(null);
    }
  });

  // Clean up the listener when the component is unmounted
  return () => unsubscribe();
}, [auth]);



return (
  <div className={styles.navBar}> 
    <div className={styles.logoContainer}>
      {/* Place your logo here */}
    </div>

    <div className={styles.navLinks}>
      {!user && (
        <li><Link to="/" className={styles.navLink}>Login</Link></li>
      )}
      <li><Link to="/homepage" className={styles.navLink}>My Boards</Link></li>
      {user && (
        <li><Link to="/logout" className={styles.navLink}>Log Out</Link></li>
      )}
    </div>

    {/* Right side container for icons */}
    <div className={styles.rightSideIcons}>
      {user && (
        <div className={styles.topRightIcons}>
          {/* Include the NavIcons component here */}
          <NavIcons />
        </div>
      )}
    </div>
  </div>
);
}

export default Nav;