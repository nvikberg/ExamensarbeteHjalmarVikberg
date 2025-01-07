import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../Data/firebase';
import NavIcons from './NavIcons';
import FetchBoard from './FetchBoards';
import Logout from './Logout';
import styles from '../CSS/Nav.module.css';


const Nav: React.FC<{}> = () => {

  //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
  const [user, setUser] = useState<any>('');
  const [invitations, setInvitations] = useState<any[]>([]); // Store invitations
  const auth = getAuth();

  useEffect(() => {
    // Listen for changes in the user's authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is logged in
        setUser(currentUser);
        fetchInvitations(currentUser.uid); //hämtar invitations för usern som är inloggad

      } else {
        // User is logged out
        setUser(null);
        setInvitations([]); //sätter till noll om usern är utloggad

      }
    });

    //sluta lyssna 
    return () => unsubscribe();
  }, [auth]);

  const fetchInvitations = (userID: string) => {
    const invitationsQuery = query(
      collection(db, 'Invitations'),
      where('receiverID', '==', userID),
      where('status', '==', 'pending')
    );

    // lyssnar efter ändringar med snapshot
    const unsubscribeInvitations = onSnapshot(invitationsQuery, (snapshot) => {
      const invitationData: any[] = [];
      snapshot.forEach((doc) => {
        invitationData.push(doc.data());
      });
      setInvitations(invitationData);
    });

    //slutar lyssna
    return () => unsubscribeInvitations();
  };

      return (
        <div className={styles.navBar}>
          <div className={styles.logoContainer}>
            {'Logo'}
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
                <NavIcons invitations={invitations} />
              </div>
            )}
          </div>
        </div>
      );
    }

export default Nav;