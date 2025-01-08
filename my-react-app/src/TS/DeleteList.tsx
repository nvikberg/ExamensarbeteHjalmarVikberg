import React, { useState } from "react";
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../Data/firebase";
import '../CSS/DeleteBoard.css';

interface DeleteListsProps {
    boardId: string;
    listtitle: string;
    onListDeleted: () => void;  // Callback to trigger updates after deletion
}


const DeleteLists: React.FC<DeleteListsProps> = ({ boardId, listtitle, onListDeleted }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isShown, setIsShown] = useState(false);

    const showDeleteList = () => {
        setIsShown(true);
    }
    const hideDeleteList = () => {
        setIsShown(false);
    }

    const showOptionList = () => {
        setIsVisible(true);
    };

    const hideDelete = () => {
        setIsVisible(false);
    };

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

            if (!cardsSnapshot.empty) {
            // Delete all cards associated with this list
            const cardsRef = collection(db, "Cards");
            const cardsQuery = query(cardsRef, where("boardID", "==", boardId), where("listtitle", "==", listtitle));
            const cardsSnapshot = await getDocs(cardsQuery);

            
            

            // Batch delete cards
            const deletePromises = cardsSnapshot.docs.map((cardDoc) => 
                deleteDoc(cardDoc.ref));
            await Promise.all(deletePromises);
        }

            alert(`List "${listtitle}" and its cards deleted successfully!`);
            setIsVisible(false);
            setIsShown(false);
            onListDeleted();  // Trigger re-render after deletion
        } catch (error) {
            console.error("Error deleting list and cards:", error);
            alert("Failed to delete list. Please try again.");
        }
    };

    return (
        <div>
            <button onClick={showDeleteList} aria-haspopup="true">...</button>
            {isShown && (
                <div className="deleteQuestion">
                    <h2>Delete this list and its cards?</h2>
                    <button onClick={showOptionList} className="confirm-btn">Yes, Delete</button>
                    <button onClick={hideDeleteList} className="cancel-btn">Cancel</button>
                    {isVisible && (
                    <div className="confirmation-modal">
                        <div className="modal-content">
                            <h2>Are you sure you want to delete this list and all its cards?</h2>
                            <div className="modal-buttons">
                                <button onClick={handleDelete} className="confirm-btn">Yes, Delete</button>
                                <button onClick={hideDelete} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DeleteLists;
