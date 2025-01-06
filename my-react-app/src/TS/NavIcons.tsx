import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEnvelope, faUser, faShoppingCart, } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import styles from '../CSS/Nav.module.css';

interface NavIconsProps {
    invitations: any[];
}

const NavIcons: React.FC<NavIconsProps> = ({ invitations }) => {
    const pendingInvitationsCount = invitations.length; //tar ut hur många pending invitations 

    //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
    const [user, setUser] = useState<any>('');
    const auth = getAuth();
    const navigate = useNavigate();


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


    // Funktion för att hantera klick på hjärta-ikon (Wishlist)
    const handleProfileIconClick = () => {
        if (user) {
            navigate('/profilepage')
        }
    }

    // Funktion för att hantera klick på varukorogs-ikon
    const handleEnvelopeIconClick = () => {
        navigate("/inbox");
    };


    return (
        <div className={styles.rightSideIcons}>
            <div className={styles.topRightIcons}>
                <FontAwesomeIcon
                onClick={handleEnvelopeIconClick}
                    icon={faEnvelope}
                    className={`${styles.icon} ${pendingInvitationsCount > 0 ? styles.red : ''}`}
                />
                {pendingInvitationsCount > 0 && (
                    <span className={styles.invitationCount}>{pendingInvitationsCount}</span>
                )}
                <FontAwesomeIcon icon={faUser} onClick={handleProfileIconClick} className={`${styles.icon} ${styles.userIcon}`} />
            </div>
        </div>
    );
}

export default NavIcons;