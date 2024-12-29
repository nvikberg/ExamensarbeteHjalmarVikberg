import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { doc, getDoc } from 'firebase/firestore'; 
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

        if (boardDoc.exists()) {
          console.log("Fetched Board Document:", boardDoc.data());

          const boardData = boardDoc.data();
          const listTitles = boardData?.listTitle || []; // Match the correct field name
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

  return (
    <div className="lists-container">
      {lists.map(list => (
        <div className="list-card" key={list.id}>
          <h3 className="list-title">{list.listTitle}</h3>
          <div className="cardContainer">
            {/* Render cards here */}
          </div>
          <button className="add-card-button">Add Card</button>
        </div>
      ))}
    </div>
  );
};

export default Lists;
  
