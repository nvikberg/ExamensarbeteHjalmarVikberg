import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Data/firebase";
import { doc, getDoc } from "firebase/firestore";
import Lists from "./Lists";
import AddLists from "./AddList";

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardName, setBoardName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBoardName = async () => {
      if (!boardId) return;

      try {
        const boardDocRef = doc(db, "Boards", boardId); // Reference to the board document
        const boardDoc = await getDoc(boardDocRef);

        if (boardDoc.exists()) {
          const boardData = boardDoc.data();
          setBoardName(boardData?.boardname || "Unnamed Board");
        } else {
          console.error("Board not found");
        }
      } catch (error) {
        console.error("Error fetching board name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardName();
  }, [boardId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!boardId) {
    return <p>Board not found</p>;
  }

  return (
    <div>
      <h1>{boardName}</h1>
      <div className="lists">
      <Lists boardId={boardId} />
      <AddLists boardId={boardId} />
      </div>      
    </div>
  );
};

export default Board;
