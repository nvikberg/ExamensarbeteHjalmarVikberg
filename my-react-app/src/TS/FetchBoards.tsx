import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';  
import { collection, getDocs } from 'firebase/firestore'; 

//Hämtar alla anslagstavlorna i en array

const FetchBoard: React.FC = () => {
  const [boards, setBoards] = useState<any[]>([]);  
  const [loading, setLoading] = useState(true);  

  useEffect(() => {
    const fetchBoards = async () => {
      const boardsCollection = collection(db, 'Boards'); 
      const querySnapshot = await getDocs(boardsCollection);  // Fetch all documents from the collection

      const boardsData: any[] = [];
      querySnapshot.forEach((doc) => {
        boardsData.push({ id: doc.id, ...doc.data() });  // push board data into an array
      });

      setBoards(boardsData);  // Update state with fetched boards data
      setLoading(false); 
    };

    fetchBoards();
  }, []); 

  return (
    <div>
      <h1>All Boards</h1>
      {loading ? (
        <p>Loading boards...</p>
      ) : boards.length > 0 ? (
        <div>
          {/* Map over the boards and display each board's data */}
          {boards.map((board) => (
            <div key={board.id}>
              <h2>{board.boardname}</h2>
            </div>
          ))}
        </div>
      ) : (
        <p>No boards found</p>
      )}
    </div>
  );
};

export default FetchBoard;
