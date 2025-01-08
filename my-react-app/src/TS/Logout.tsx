import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Data/firebase"; // Import Firebase Auth
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import styles from '../CSS/Logout.module.css'

 
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


const showDelete = () => {
    setVisible(true);
    console.log('show delete funk')
};

// Function to hide the confirmation modal
const hideDelete = () => {
    setVisible(false);
};

const handleLogout = async () => {
    try{
        await signOut(auth);
        // alert("logged out")
        // console.log(auth + "logge dout")
        navigate('/')
    } catch (error){
        console.error("error logging out", error)
    }
}

return (
    <>
        <button className={styles.logoutButton} onClick={showDelete}>Log out</button>
        {/* Confirmation Modal */}
        {isVisible && (
            <div className={styles.confirmationModal}>
                <div className={styles.modalContent}>
                    <h2>Are you sure you want to log out?</h2>
                    <div className={styles.modalButtons}>
                        <button onClick={handleLogout} className={styles.confirmBtn}>
                            Yes, Logout
                        </button>
                        <button onClick={hideDelete} className={styles.cancelBtn}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);
};
 
export default Logout;