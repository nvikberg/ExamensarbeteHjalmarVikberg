import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/homepage.css";
import { db } from "../Data/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, DocumentReference } from "firebase/firestore";
import AddBoards from "./AddBoards";

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
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser; //hämtar användaren som är inloggad genom firebase auth


        if (!user) {
          console.error("No user is logged in")
          navigate("/login");
          return;
        }

        const userDocRef = doc(db, "Users", user.uid);
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
                title: boardData.boardname || "",
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
