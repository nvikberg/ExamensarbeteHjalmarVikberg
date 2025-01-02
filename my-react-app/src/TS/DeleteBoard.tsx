import React, { useState, useEffect } from "react";
import { doc, deleteDoc, deleteField, collection, query, where, getDocs, updateDoc, arrayRemove} from "firebase/firestore";
import { db } from "../Data/firebase";
import '../CSS/DeleteBoard.css';
import { useNavigate } from "react-router-dom";

//Hämtar proops från homepage, delete knappen är kopplad till varje board.
//Den deletar på 2 ställen
//1. 'Boards' - Hela boarden, 2.Users - 'boardId' (alla users som har det specifika boardID i sin array)

interface Props {
 boardID: string;
 userID: string;

}


const DeleteBoard: React.FC<Props>= ({ boardID, userID }) => {
    const [isVisible, setVisible] = useState<boolean>(false); 
    const navigate = useNavigate();

    const handleDelete = async (): Promise<void> => {
        try {
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
            alert('Board was deleted')
            navigate('/homepage')
        
        } catch (error) {
            console.error("Error deleting board:", error);
        }
    };

    const showDelete = () => {
        setVisible(true);
      };
    
      // Function to hide the confirmation modal
      const hideDelete = () => {
        setVisible(false);
      };
    
    

      return (
        <div>
          <button onClick={showDelete} className="deleteButton">Delete Board</button>
    
          {/* Confirmation Modal */}
          {isVisible && (
            <div className="confirmation-modal">
              <div className="modal-content">
                <h2>Are you sure you want to delete this board?</h2>
                <div className="modal-buttons">
                  <button onClick={handleDelete} className="confirm-btn">Yes, Delete</button>
                  <button onClick={hideDelete} className="cancel-btn">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    

export default DeleteBoard;