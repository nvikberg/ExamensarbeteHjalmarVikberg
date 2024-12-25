import { Link } from 'react-router-dom';
import React from 'react';
import styles from '../CSS/Nav.module.css';
import FetchBoard from './FetchBoards';
import Logout from './Logout';

const Nav: React.FC<{}> = () => {


  return (
    <div className={styles.navBar}> 
      <div className={styles.logoContainer}>
    {/* vi lägger loggan här */}
      </div>
      <div className={styles.linksContainer}>
        <ul className={styles.navLinks}>
          <li><Link to="/" className={styles.navLink}>Login</Link></li>
          <li><Link to="/homepage" className={styles.navLink}>My Boards</Link></li>
          {/* <li><Link to="/boards" className={styles.navLink}>Boards</Link></li> */}
          <li><Link to="/logout" className={styles.navLink}>Log Out</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Nav;
