import React, { useEffect, useState } from 'react';
import { db } from '../Data/firebase';
import { getAuth, updateCurrentUser } from 'firebase/auth';
import { getDoc, collection, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import styles from '../CSS/ProfilePage.module.css';
import DeleteUser from './DeleteUser';
import Logout from './Logout';

interface User {
    uid: string;
    email: any;
    fName: string;
    lName: string;
    created: any;
    profilePic?: string;
    bio?: string;
}

const ProfilePage: React.FC = ({ }) => {
    const [newFirstName, setNewListTitle] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>('')
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

    async function handleSaveName() {
        if (!newFirstName.trim() && newLastName.trim()) {
            setSuccessMessage(`Please enter your name`);
            setTimeout(() => setSuccessMessage(''), 3000);
            return;
        }

        setLoading(true);
        try {    
            if (!currentUser || !currentUser.uid) {
                throw new Error("User not logged in.");
            }        
            const userRef = doc(db, "Users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()){
                await updateDoc(userRef, {
                    firstName: newFirstName.trim(),
                    lastName: newLastName.trim(),
                });
            }else {
                await setDoc(userRef, {
                    firstName: newFirstName.trim(),
                    newLastName: newLastName.trim(),
                })
            }
            setSuccessMessage('Name updated successfully!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error updating name:', error);
            setSuccessMessage('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
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
                    <form className={styles.saveNameForm}>
                        <p>Add your name to your profile:</p>
                        <input type="text" value={newFirstName} placeholder='Firstname' />
                        <input type="text" value={newLastName} placeholder='Lastname' />
                        <button onClick={handleSaveName}>Save name</button>
                    </form>
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
