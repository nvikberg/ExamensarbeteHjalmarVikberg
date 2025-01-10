import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../CSS/Homepage.module.css";
import { db } from "../Data/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs, onSnapshot } from "firebase/firestore";
import AddBoards from "./AddBoards";
import DeleteBoard from "./DeleteBoard";

//nu ska invitation funka som det ska, 
//om en invitation är accepterad så ska boarden visas på homepage
//board som är skapad av current user ska alltid visas 

interface UserData {
  boardID: string[]; // Array of Firestore references to board documents
}

interface BoardData {
  boardname: string;
  members: string[];
  backgroundImage: string;

}

interface Item {
  id: string;
  title: string;
  members: string[];
  backgroundImage: string; //background image for each board

}

const HomePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Store the current user
  const [randomPhotoUrl, setRandomPhotoUrl] = useState<string>(""); //för bakgrundsbilden
  const navigate = useNavigate();
  const auth = getAuth();

  // Fetch all boards the user is a part of when they log in
  const fetchBoards = async (user: any) => {
    try {
      const userDocRef = doc(db, "Users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        const boardIDs = userData.boardID || []; // Array of DocumentReferences

        const boardsData: Item[] = [];

        // Iterate over the boardRefs, which are DocumentReferences
        for (const boardID of boardIDs) {
          // Check if user has accepted the invitation for boards they are invited to
          const invitationQuery = query(
            collection(db, "Invitations"),
            where("receiverID", "==", user.uid),
            where("boardID", "==", boardID),
            where("status", "==", "accepted") // Only consider accepted invitations
          );
          const invitationSnapshot = await getDocs(invitationQuery);

          if (!invitationSnapshot.empty) {
            // If accepted invitation exists, fetch the board data
            const boardRef = doc(db, "Boards", boardID);
            const boardDoc = await getDoc(boardRef);

            if (boardDoc.exists()) {
              const boardData = boardDoc.data();
              boardsData.push({
                id: boardDoc.id,
                title: boardData?.boardname || "",
                members: boardData?.members || [],
                backgroundImage: boardData?.backgroundImage || "", //adderar bakgrundsbilden 

              });
            }
          }
        }

        // Fetch boards the user is the creator of, regardless of invitation status
        const boardsCreatedByUserQuery = query(
          collection(db, "Boards"),
          where("userID", "==", user.uid) // Fetch boards where the user is the creator
        );
        const createdBoardsSnapshot = await getDocs(boardsCreatedByUserQuery);

        createdBoardsSnapshot.forEach((doc) => {
          const boardData = doc.data() as BoardData;
          boardsData.push({
            id: doc.id,
            title: boardData?.boardname || "",
            members: boardData?.members || [],
            backgroundImage: boardData?.backgroundImage || "",
          });
        });

        // Set the boards data into state
        setItems(boardsData);
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching boards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.error("No user is logged in");
        navigate("/"); // Redirect to login page if no user is logged in
        return;
      }

      setUser(user); // Set the user state
      fetchBoards(user); // Fetch the boards for the user when authenticated
    });

    return () => unsubscribeAuth();
  }, [auth, navigate]);

  useEffect(() => {
    if (user) {
      const boardsCollectionRef = collection(db, "Boards");

      // Subscribe to changes in the boards collection for real-time updates
      const q = query(boardsCollectionRef, where("userID", "==", user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedBoards: Item[] = [];
        snapshot.forEach((doc) => {
          const boardData = doc.data() as BoardData;
          updatedBoards.push({
            id: doc.id,
            title: boardData.boardname || "",
            members: boardData.members,
            backgroundImage: boardData?.backgroundImage || "",
          });
        });

        // Update state with the new board data
        setItems(updatedBoards);
      });

      // Clean up the subscription when the component unmounts
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className={styles.main}>
      <div className={styles.homepageContainer}>
        <h1>Your Boards</h1>
        {loading ? (
          <p>Loading boards...</p>
        ) : (
          <div className={styles.gridContainer}>
            {/* Always show the AddBoards component */}
            <AddBoards />

            {items.length > 0 ? (
              items.map((item) => (
                <div key={item.id} className={styles.gridItemWrapper}>
                  {/* Card Container */}
                  <div
                    className={styles.gridItem}
                    style={{
                      backgroundImage: item.backgroundImage
                        ? `url("${encodeURI(item.backgroundImage)}")`
                        : 'none', //SÄTT FÄRG PÅ HEMSIDAN
                    }}
                    onClick={() => navigate(`/board/${item.id}`)}
                  >
                    <h3>{item.title}</h3>
                    <p>Members: </p>
                    <p>{Array.isArray(item.members) ? item.members.join(", ") : 'No members'}</p>
                    <div className={styles.deleteButtonContainer} onClick={(e) => e.stopPropagation()}>
                      <DeleteBoard boardID={item.id} userID={user?.uid} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No boards found for this user</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
