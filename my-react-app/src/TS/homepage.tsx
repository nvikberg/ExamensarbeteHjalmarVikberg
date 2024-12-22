import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/homepage.css";
import { db } from "../Data/firebase";
import { collection, getDocs, doc, getDoc, DocumentReference } from "firebase/firestore";
import AddBoards from "./AddBoards";
import FetchBoard from "./FetchBoards";

interface UserData {
  boardID: DocumentReference[]; // Array med references
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDocRef = doc(db, "Users", "BjtRnJUgI3LZhJkMDNzT"); // Hardcoded user ID change to logged in user later
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          const boardRefs = userData.boardID || []; // Array of Firestore references

          console.log("User Data:", userData);

          // fetch the boards using references
          const boardsData: Item[] = [];
          for (const boardRef of boardRefs) {
            const boardDoc = await getDoc(boardRef);

            if (boardDoc.exists()) {
              const boardData = boardDoc.data() as BoardData;
              console.log("Board Data:", boardData);

              boardsData.push({
                id: boardDoc.id,
                title: boardData.boardname || "Untitled",
              });
            } else {
              console.warn(`Board with reference ${boardRef.id} does not exist.`);
            }
          }

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

    fetchData();
  }, []);

  return (
    <div className="main">
              <AddBoards></AddBoards>
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
