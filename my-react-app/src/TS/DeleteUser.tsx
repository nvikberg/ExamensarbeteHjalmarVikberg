import React, { useState } from "react";
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from "../Data/firebase";
import { useNavigate } from "react-router-dom";
import { signOut, getAuth } from "firebase/auth";
import styles from '../CSS/ProfilePage.module.css'

interface Props {
    userID: string;
    userEmail: any;
}

const DeleteUser: React.FC<Props> = ({ userID, userEmail }) => {
    const [ isVisible, setIsVisible ] = useState<boolean>(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const handleDelete = async (): Promise<void> => {
        try {
            const user = auth.currentUser;
            if (user) {

          // Tar bort userid på board collection
          const boardsCollectionRef = collection(db, "Boards");
          const boardsQuery = query(boardsCollectionRef, where("members", "array-contains", userEmail));
    
          const boardSnapshot = await getDocs(boardsQuery);
    
          //loopar igeom och tar bort userid på alla boards hen är associerad med
          boardSnapshot.forEach(async (boardDoc) => {
            const boardRef = doc(db, "Boards", boardDoc.id);
            await updateDoc(boardRef, {
              members: arrayRemove(userEmail), //tar bort user ID från boards
            });
            console.log(`deleted userEmail from members in board Collection ${boardDoc.id}`);
          });
    
          //tar bort user på authentication
          await user.delete();
        console.log("user is deleted from Firebase Auth");
          // Tar bort själva Usern på user colletion
          const userDocRef = doc(db, "Users", userID);
          await deleteDoc(userDocRef);
          console.log(`user with id ${userID} was deleted.`);
    
          // tar bort alla invitations som userid är associerad med
          const invitationsQuery = query(
            collection(db, "Invitations"),
            where("receiverID", "==", userID)
          );
    
          const invitationsSnapshot = await getDocs(invitationsQuery);
    
          invitationsSnapshot.forEach(async (invitationDoc) => {
            await deleteDoc(doc(db, "Invitations", invitationDoc.id));
            console.log(`invitation deleted with id ${invitationDoc.id}`);
          });
    
          //loggar ut usern och navigera till login
        await signOut(auth);
          navigate('/');
        }else{
        console.error("error finding user")
        }
        } catch (error) {
          console.error("error deleting user", error);
        }
  
};
    
      // Show confirmation modal
      const showDelete = () => {
        setIsVisible(true);
      };
    
      // Hide the confirmation modal
      const hideDelete = () => {
        setIsVisible(false);
      };
    
      return (
        <div>
          <button className={styles.deleteUserButton} onClick={showDelete}> Delete User</button>
    
          {/* Confirmation (frågar en extra gång innan delelte ) Modal */}
          {isVisible && (
            <div className={styles.confirmationModal}>
              <div className={styles.modalContent}>
                <h2>Are you sure you want to delete this user?</h2>
                <div className={styles.modalButtons}>
                  <button onClick={handleDelete} className={styles.confirmBtn}>Yes, Delete</button>
                  <button onClick={hideDelete} className={styles.cancelBtn}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default DeleteUser;