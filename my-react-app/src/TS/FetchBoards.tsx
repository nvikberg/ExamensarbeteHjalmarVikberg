import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';  
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import AddBoards from './AddBoards';

// Fetch and display boards only for the logged-in user, if they have accepted the invitation
const FetchBoard: React.FC = () => {
  const [boards, setBoards] = useState<any[]>([]);  
  const [loading, setLoading] = useState(true);  
  const [user, setUser] = useState<any>(null); // Store the current user
  const auth = getAuth(); // Firebase authentication

  useEffect(() => {
    const fetchBoards = async () => {
      const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          console.error("No user is logged in");
          setLoading(false);
          return;
        }

        try {
          setUser(user); // Set the user state

          // Fetch user data to get board IDs
          const userDocRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as { boardID: string[] }; // Get board IDs
            const boardIDs = userData.boardID || [];

            const boardsData: any[] = [];

            // Loop through each board ID and check if the user has accepted the invitation
            for (const boardID of boardIDs) {
              const invitationQuery = query(
                collection(db, "Invitations"),
                where("receiverID", "==", user.uid),
                where("boardID", "==", boardID),
                where("status", "==", "accepted") // Only consider accepted invitations
              );
              const invitationSnapshot = await getDocs(invitationQuery);

              if (!invitationSnapshot.empty) {
                // If an accepted invitation exists, fetch the board data
                const boardRef = doc(db, "Boards", boardID);
                const boardDoc = await getDoc(boardRef);

                if (boardDoc.exists()) {
                  const boardData = boardDoc.data();
                  boardsData.push({ id: boardDoc.id, ...boardData });
                }
              }
            }

            setBoards(boardsData); // Update state with the fetched boards data
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching boards:", error);
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribeAuth(); // Clean up on unmount
    };

    fetchBoards(); // Fetch the boards when component mounts
  }, [auth]); // Dependency on auth for when the user is authenticated

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
      <div>
        <AddBoards />
      </div>
    </div>
  );
};

export default FetchBoard;
