import React, { useState } from "react";
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../Data/firebase";
import styles from '../../CSS/Lists.module.css'


//MÅSTE KOLLA PÅ!
//Delete fungerear men man får upp error att delete failed 

interface DeleteListsProps {
    boardId: string;
    listtitle: string;
    // onListDeleted: () => void;  // Callback to trigger updates after deletion
}


const DeleteLists: React.FC<DeleteListsProps> = ({ boardId, listtitle }) => {
    const [isVisible, setIsVisible] = useState(false);
    const showOptionList = () => setIsVisible(true);
    const hideDelete = () => setIsVisible(false);

    const handleDelete = async () => {
        if (!boardId) {
            console.error("Error: boardId is missing");
            return;
        }
        try {
            // Delete the list from the board document
            const boardDocRef = doc(db, "Boards", boardId);
            await updateDoc(boardDocRef, {
                listTitle: arrayRemove(listtitle)
            });

            
            // Delete all cards associated with this list
            const cardsRef = collection(db, "Cards");
            const cardsQuery = query(cardsRef, where("boardID", "==", boardId), where("listtitle", "==", listtitle));
            const cardsSnapshot = await getDocs(cardsQuery);

            if (!cardsSnapshot.empty) {
            // Batch delete cards
            const deletePromises = cardsSnapshot.docs.map((cardDoc) => 
                deleteDoc(cardDoc.ref));
            await Promise.all(deletePromises);
        }
            setIsVisible(false);
        } catch (error) {
            console.error("Error deleting list and cards:", error);
        }
    };

    return (
        <div>
            <button className={styles.smallDeleteButton} onClick={showOptionList} aria-haspopup="true">Delete List</button>
                    {isVisible && (
                    <div className={styles.confirmationModal}>
                        <div className={styles.modalContent}>
                            <h2>Are you sure you want to delete this list and all its cards?</h2>
                            <div className={styles.modalButtons}>
                                <button onClick={handleDelete} className={styles.confirmBtn}>Yes, Delete</button>
                                <button onClick={hideDelete} className={styles.cancelBtn}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
    );
}

export default DeleteLists;
