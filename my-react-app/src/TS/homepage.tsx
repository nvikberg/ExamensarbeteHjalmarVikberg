import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/homepage.css";
import { db } from "../Data/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, query, collection, where, onSnapshot } from "firebase/firestore";
import AddBoards from "./AddBoards";

interface UserData {
  boardID: string[]; // Array of Firestore references to board documents
}

interface BoardData {
  boardname: string;
}

interface Item {
  id: string;
  title: string;
}

const Homepage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null); // Store the current user
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      try {
        const currentUser = auth.currentUser; // Get the logged-in user
        if (!currentUser) {
          console.error("No user is logged in");
          navigate("/");
          return;
        }
        setUser(currentUser); // Set the user state

        const userDocRef = doc(db, "Users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          const boardIDs = userData.boardID || []; // Array of DocumentReferences

          console.log("User Data:", userData);
          console.log("Board ids", boardIDs);

          //skapar array för att hålla boardseen
          const boardsData: Item[] = [];

          // Iterate over the boardRefs, which are DocumentReferences
          for (const boardID of boardIDs) {
            // Use getDoc() to fetch the document data from Firestore
            const boardRef = doc(db, "Boards", boardID);  //Behövde lägga till doc för att få ut datan ur referensen 

            const boardDoc = await getDoc(boardRef);


            console.log("Board Ref2", boardRef); //debugging

            if (boardDoc.exists()) {
              const boardData = boardDoc.data() as BoardData;
              console.log("Board Data:", boardData);

              //lägger till board datan till den tomma arrayen
              boardsData.push({
                id: boardDoc.id,
                title: boardData.boardname || "", // Use the board name
              });
            } else {
              console.warn(`Board with reference ${boardRef.id} does not exist.`);
            }
          }

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

    // Call the function to check user and fetch data
    checkUserAndFetchData();
  }, [auth.currentUser, navigate]); // Add navigate and auth.currentUser as dependencies


  //lyssnar efter updateringar på bords collection (För att ny board ska synas direkt utan uppdatera) 
  useEffect(() => {
    setUser(auth.currentUser)
    if (user) {
      const boardsCollectionRef = collection(db, "Boards");

      // Subscribe to changes in the boards collection
      const q = query(boardsCollectionRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedBoards: Item[] = [];
        snapshot.forEach((doc) => {
          const boardData = doc.data() as BoardData;
          updatedBoards.push({
            id: doc.id,
            title: boardData.boardname || "", // Get the board name
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
    <div className="main">
      <AddBoards />
      <div className="homepage-container">
        <h1>Your Boards</h1>
        {loading ? (
          <p>Loading boards...</p>
        ) : items.length > 0 ? (
          <div className="grid-container">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid-item"
                onClick={() => navigate(`/board/${item.id}`)}
              >
                <h3>{item.title}</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>No boards found for this user</p>
        )}
      </div>
    </div>
  );
};

export default Homepage;
