import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { doc, getDoc } from 'firebase/firestore'; 
import '../CSS/Lists.css';
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

  return (
    <div className="lists-container">
      {lists.map(list => (
        <div className="list-card" key={list.id}>
          <h3 className="list-title">{list.listTitle}</h3>
          <div className="cardContainer">
            <AddCards boardId={boardId} listTitle={list.listTitle} userId={userId} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Lists;
  
