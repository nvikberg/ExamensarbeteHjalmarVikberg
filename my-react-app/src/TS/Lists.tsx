import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { doc, getDoc } from 'firebase/firestore'; // Use doc and getDoc to fetch a specific board
import '../CSS/Lists.css';

interface BoardData {
  id: string;
  listTitle: string;
}

interface BoardProps {
  boardId: string; 
}

const Lists: React.FC<BoardProps> = ({ boardId }) => {
  const [lists, setLists] = useState<BoardData[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const boardDocRef = doc(db, 'Boards', boardId); 
        const boardDoc = await getDoc(boardDocRef);

        console.log("Fetched Board Document:", boardDoc.data()); 
  
        if (boardDoc.exists()) {
          const boardData = boardDoc.data();
  
          const listTitles = boardData?.listTitles || []; 
          console.log("List Titles:", listTitles); // Log list titles to see if data is correct

  
          // Map the list titles into the state
          const fetchedLists: BoardData[] = listTitles.map((title: string, index: number) => ({
            listTitle: title,
          }));
  
          setLists(fetchedLists);
        } else {
          console.log("Board not found");
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };
  
    fetchLists();
  }, [boardId]);
  
  return (
    <div className="lists-container">
      {lists.map(list => (
        <div className="list-card" key={list.id}>
          <h3 className="list-title">{list.listTitle}</h3>
          <div className="cardContainer">
            {/* Lägg till card ordentligt */}
          </div>
          <button className="add-card-button">
            Add Card
          </button>
        </div>
      ))}
    </div>
  );
};

export default Lists;
