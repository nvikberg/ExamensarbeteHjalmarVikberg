import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import styles from "../CSS/Lists.module.css"
import CardsComponent from './Cards';
import AddCards from './AddCard';
import { getAuth } from 'firebase/auth';

interface BoardData {
  id: string;
  listTitle: string;
}

interface BoardProps {
  boardId: string; 
}

const Lists: React.FC<BoardProps> = ({ boardId }) => {
  const [lists, setLists] = useState<BoardData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setUserId(user ? user.uid : null);

    const fetchLists = async () => {
      try {
        const boardDocRef = doc(db, 'Boards', boardId); 
        const boardDoc = await getDoc(boardDocRef);

        if (boardDoc.exists()) {
          console.log("Fetched Board Document:", boardDoc.data());

          const boardData = boardDoc.data();
          const listTitles = boardData?.listTitle || []; 
          console.log("List Titles:", listTitles);

          const fetchedLists: BoardData[] = listTitles.map((title: string, index: number) => ({
            id: `${boardId}-list-${index}`,
            listTitle: title,
          }));

          setLists(fetchedLists);
        } else {
          console.error("Board not found");
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, [boardId]);

  if (!userId) {
    return <p>Loading user information...</p>;
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Allow the drop
    event.currentTarget.classList.add("drag-over"); // Add the visual indicator
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove("drag-over"); // Remove the visual indicator
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, newListTitle: string) => {
    event.preventDefault(); // Allow the drop
    event.currentTarget.classList.remove("drag-over"); // Remove the visual indicator after drop
    handleDropCard(event, newListTitle); // Your existing logic for handling the drop
  };
  

  const handleDropCard = async (event: React.DragEvent<HTMLDivElement>, newListTitle: string) => {
    event.preventDefault();
  
    const cardId = event.dataTransfer.getData("cardId");
  
    if (!cardId) {
      console.error("Card ID not found in drag event.");
      return;
    }
  
    try {
      const cardDocRef = doc(db, "Cards", cardId);
      await updateDoc(cardDocRef, {
        listtitle: newListTitle,
      });
  
      alert("Card moved successfully!");
    } catch (error) {
      console.error("Error updating card listtitle:", error);
      alert("Failed to move the card.");
    }
  };
  

  const enableDropping = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }


  return (
    <div className={styles.listsContainer}>
      {lists.map((list) => (
        <div
          className={styles.listCard}
          key={list.id}
          onDragOver={(event) => {
            enableDropping(event); 
            handleDragOver(event); 
          }}
          onDragLeave={handleDragLeave} 
          onDrop={(event) => handleDrop(event, list.listTitle)}
        >
          <h3 className={styles.listTitle}>{list.listTitle}</h3>
          <div className={styles.cardContainer}>
            <CardsComponent boardId={boardId} listTitle={list.listTitle} />
            <AddCards boardId={boardId} listTitle={list.listTitle} userId={userId} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Lists;
  
