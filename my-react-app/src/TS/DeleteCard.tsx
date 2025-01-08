import React, { useState } from "react";
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../Data/firebase";
import '../CSS/DeleteBoard.css';

interface DeleteCardProps {
    id: string;
}


const DeleteCards: React.FC<DeleteCardProps> = ({ id }) => {
    const [isShown, setIsShown] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // To prevent multiple clicks

    const showDeleteCard = () => setIsShown(true);
    const hideDeleteCard = () => setIsShown(false);

    const handleDelete = async () => {
        console.log("Card ID received:", id);
        if (!id || id.trim() === "") {
            console.error("Error: Missing card ID.");
            return;
        }

        if (isDeleting) return; //prevent duble delete clicks
        setIsDeleting(true);

        try {
            const cardDocRef = doc(db, "Cards", id);
            await deleteDoc(cardDocRef);
            console.log("Card deleted successfully")
            hideDeleteCard();
        } catch (error) {
            console.error("Error deleting card", error);

        } finally {
            setIsDeleting(false);
        }
    };





    return (
        <div>
            <button onClick={showDeleteCard} aria-haspopup="true">Delete Card</button>
            {isShown && (
                <div className="deleteQuestion">
                    <h2>Delete this card?</h2>
                    <button onClick={handleDelete} className="confirm-btn" disabled={isDeleting}>Yes, Delete</button>
                    <button onClick={hideDeleteCard} className="cancel-btn">Cancel</button>
                </div>
            )}
        </div>
    );
}

export default DeleteCards;
