import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Data/firebase"; // Import Firebase Auth
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
// import styles from '../CSS/Logout.module.css'
import navStyles from '../CSS/Nav.module.css'


 
//modal dialog rutan visas inte när man klickar på logga ut. Man vblir ändå utloggad direkt 

const Logout: React.FC = () => {
    const [user, setUser] = useState<any>('');
    const [isVisible, setVisible] = useState<boolean>(false);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
              setUser(user);
              console.log(user)
            } else {
              setUser(null); 
            }
    });

    return () => unsubscribe();
}, [auth]);


const showLogout = () => {
    setVisible(true);
    console.log('show delete funk')
};

// Function to hide the confirmation modal
const hideLogout = () => {
    setVisible(false);
};

const handleLogout = async () => {
    try{
        await signOut(auth);
        navigate('/')
        setVisible(false);
    } catch (error){
        console.error("error logging out", error)
    }
}

return (
    <div>
        <button className={navStyles.logoutButton} onClick={showLogout} aria-haspopup="true">Log out</button>
        {/* Confirmation Modal */}
        {isVisible && (
            <div className={navStyles.confirmationModal}>
                <div className={navStyles.modalContent}>
                    <h2>Are you sure you want to log out?</h2>
                    <div className={navStyles.modalButtons}>
                        <button onClick={handleLogout} className={navStyles.confirmBtn}>Yes, Logout </button>
                        <button onClick={hideLogout} className={navStyles.cancelBtn}> Cancel </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};
 
export default Logout;