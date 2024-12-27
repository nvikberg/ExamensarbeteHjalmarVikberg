import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Lists.css';

interface BoardData {
  id: string;
  listtitle: string;
}

const Lists: React.FC = () => {
  const [lists, setLists] = useState<BoardData[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'lists'));
        const fetchedLists: BoardData[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          listtitle: doc.data().listtitle,
        }));
        setLists(fetchedLists);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    fetchLists();
  }, []);

  return (
    <div className="lists-container">
      {lists.map(list => (
        <div className="list-card" key={list.id}>
          <h3 className="list-title">{list.listtitle}</h3>
          <button className="add-card-button">
            Add Card
          </button>
        </div>
      ))}
    </div>
  );
};

export default Lists;
