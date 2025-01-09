import React, { useState, useEffect } from "react";
import { doc, deleteDoc, deleteField, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../Data/firebase";
import styles from '../CSS/DeleteBoard.module.css';
import { useNavigate } from "react-router-dom";

//Hämtar props från homepage, delete knappen är kopplad till varje board.
//Den deletar på 3 ställen
//1. Invitations - Alla invitations som har det boardID
//2. Cards - alla cards associerade med boardid
//3. Boards - Hela boarden, 
//4. Users - 'boardId' (alla users som har det specifika boardID i sin array)

interface Props {
    boardID: string;
    userID: string;
}


const DeleteBoard: React.FC<Props> = ({ boardID, userID }) => {
    const [isVisible, setVisible] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('')
    const navigate = useNavigate();

    const handleDelete = async (): Promise<void> => {

        await deleteInvitations(boardID);

        try {
            //deletar alla cards associeraded med boarden
            const cardsQuery = query(
                collection(db, "Cards"),
                where("boardID", "==", boardID)
            );
            const cardsSnapshot = await getDocs(cardsQuery);
            cardsSnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, "Cards", docSnapshot.id)); // Delete each card
                console.log(`Card with ID: ${docSnapshot.id} deleted.`);
            });

            //deletar board doc
            const boardDocRef = doc(db, 'Boards', boardID);
            await deleteDoc(boardDocRef);
            console.log('Board deleted:', boardID);

            //Deletar boardID från alla Users boardID fält som har den boardIDn
            const usersCollectionRef = collection(db, 'Users');
            const usersQuery = query(usersCollectionRef, where('boardID', 'array-contains', boardID));

            const userSnapshot = await getDocs(usersQuery);

            //loopar igenom alla users för att kolla vem som har det boardIdt 
            userSnapshot.forEach(async (userDoc) => {
                const userRef = doc(db, 'Users', userDoc.id); //hämtar ref
                await updateDoc(userRef, {
                    boardID: arrayRemove(boardID)  //Tar bort från boardID arrayen
                });
                console.log(`Removed boardID from user ${userDoc.id}`);
            });

            console.log(`Board with ID ${boardID} has been deleted.`);

            setAlertMessage('Board was deleted');
            setTimeout(() => {
                setAlertMessage('');
            }, 3000);
            navigate('/homepage')

        } catch (error) {
            console.error("Error deleting board:", error);
            setAlertMessage('Board was not deleted');
            setTimeout(() => {
                setAlertMessage('');
            }, 3000);
        }
    };

    const showDelete = () => {
        setVisible(true);
    };

    // Function to hide the confirmation modal
    const hideDelete = () => {
        setVisible(false);
    };

    const deleteInvitations = async (boardID: string): Promise<void> => {
        try {
            //kollar vilka invitations som har det boardID
            const invitationsQuery = query(
                collection(db, "Invitations"),
                where("boardID", "==", boardID)
            );

            const invitationsSnapshot = await getDocs(invitationsQuery);

            //raderar dom invitations 
            invitationsSnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, "Invitations", docSnapshot.id)); // Delete each invitation
                console.log(`Invitation with ID: ${docSnapshot.id} deleted.`);
            });

            console.log(`All invitations associated with board ID ${boardID} have been deletd`);
        } catch (error) {
            console.error("error deleting invitations", error);
        }
    };




    return (
        <div>
            <button onClick={showDelete} className={styles.deleteButton}>Delete Board</button>

            {/* Confirmation Modal */}
            {isVisible && (
                <div className={styles.confirmationModal}>
                    <div className={styles.modalContent}>
                        <h2>Are you sure you want to delete this board?</h2>
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


export default DeleteBoard;