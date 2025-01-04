import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEnvelope, faUser, faShoppingCart,} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged} from "firebase/auth";
import styles from '../CSS/Nav.module.css';


const NavIcons: React.FC<{}> = () => {

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
  
    // Funktion för att hantera klick på varukorgs-ikon
    const handleEnvelopeIconClick = () => {
      navigate("/inbox");
    };

  
    return (
      <div className={styles.topRightIcons}>
        <FontAwesomeIcon icon={faEnvelope} onClick={handleEnvelopeIconClick} className={styles.envelopeIcon} />
        <FontAwesomeIcon icon={faUser} onClick={handleProfileIconClick} className={styles.userIcon} />
        {/* <FontAwesomeIcon icon={faShoppingCart} onClick={handleCartIconClick} /> */}
      </div>
    );
}
  
  export default NavIcons;