import React, { useEffect, useState } from 'react';
import { db } from '../Data/firebase';
import { getAuth } from 'firebase/auth';
import { getDoc, collection, query, where, doc } from 'firebase/firestore';
import styles from '../CSS/ProfilePage.module.css';
import logoutStyles from '../CSS/Logout.module.css'
import DeleteUser from './DeleteUser';
import Logout from './Logout';

interface User {
    email: any;
    created: any;
    profilePic?: string;
    bio?: string;
}

const ProfilePage: React.FC = ({ }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Add loading state
    const auth = getAuth();
    const currentUser = auth.currentUser;

    //hämtar användar datan
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userRef = doc(db, "Users", currentUser.uid); //
                    const userDoc = await getDoc(userRef); // getDoc används för singla queries, och getDocs om man ska hämta flera

                    if (userDoc.exists()) {
                        setUser(userDoc.data() as User); //sätter hela datan från usern i interfacet för att sen användas i returnen
                    } else {
                        console.error("User data not found.");
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);


    // för att få firestores datum till att kunna läsas 
    const formatDate = (timestamp: any) => {
        const date = timestamp.toDate();
        return date.toLocaleDateString();
    };

    //   if (loading) {
    //     return <div>Loading...</div>;
    //   }

    return (
        <>
            <div className={styles.logOutContainer}>
                <Logout></Logout>
            </div>
            <div className={styles.profileContainer}>

                <div className={styles.profileHeader}>
                    {/* AVATAR PROFIL PIC HÄR */}
                    {user?.profilePic && (
                        <img src={user.profilePic} alt="Profile" className={styles.profilePic}
                        />
                    )}
                    <div className={styles.profileInfo}>
                        <h2>{user?.email}</h2>
                        {user?.bio && <p className="bio">{user.bio}</p>}
                    </div>
                </div>

                <div className={styles.profileDetails}>
                    <h3>Contact Information</h3>
                    <h4 className={styles.toDo}>Att göra i kod - Lägga till så användare kan ändra email och lösen?  </h4>
                    <p><strong>Your Email</strong> {user?.email}</p>
                    <p><strong>Your account was created on</strong> {user?.created && formatDate(user.created)}</p>
                </div>
                {currentUser && <DeleteUser userID={currentUser.uid} userEmail={currentUser.email} />}
            </div>
        </>

    );
};

export default ProfilePage;