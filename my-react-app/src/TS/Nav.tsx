import { Link } from 'react-router-dom';
import React from 'react';
import styles from '../CSS/Nav.module.css';

const Nav: React.FC<{}> = () => {
  return (
    <div className={styles.navBar}> 
      <div className={styles.logoContainer}>
        Logga
      </div>
      <div className={styles.linksContainer}>
        <ul className={styles.navLinks}>
          <li><Link to="/" className={styles.navLink}>My Boards</Link></li>
          <li><Link to="/mypage" className={styles.navLink}>My Page</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Nav;