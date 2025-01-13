import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../../Data/firebase';
import NavIcons from './NavIcons';
import styles from '../../CSS/Nav.module.css';
import Logout from '../accountComponents/Logout';
const Nav: React.FC<{}> = () => {
    //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
    const [user, setUser] = useState<any>('');
    const [invitations, setInvitations] = useState<any[]>([]); // Store invitations
    const auth = getAuth();
    const navigate = useNavigate();
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
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // alert("logged out")
            // console.log(auth + "logge dout")
            navigate('/')
        } catch (error) {
            console.error("error logging out", error)
        }
    }
    return (
        <div className={styles.navBar}>
            <div className={styles.logoContainer}>
                <a>
                    <img src="/logo-niloBoard.png" alt="Nilo Logo" />
                </a>
            </div>
            <div className={styles.navLinks}>
                {!user && (
                    <li>
                        <Link to="/login" className={styles.navLink}>Login</Link>
                    </li>
                )}
                <li>
                    <Link to="/homepage" className={styles.navLink}>My Boards</Link>
                </li>
            </div>
            <div>
                {user && (
                    <div className={styles.rightSideContent}>
                        <div className={styles.topRightIcons}>
                            <NavIcons invitations={invitations} />
                        </div>
                        <Logout></Logout>
                    </div>
                )}
            </div>
        </div>
    );
}
export default Nav;