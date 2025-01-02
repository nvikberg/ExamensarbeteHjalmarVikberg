import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../Data/firebase";
import { collection, query, where, getDocs, getDoc, doc } from "firebase/firestore";
import Lists from "./Lists";
import AddLists from "./AddList";
import  styles from "../CSS/BoardPage.module.css"

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardName, setBoardName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [estimatedTotal, setEstimatedTotal] = useState<{ hours: number; minutes: number }>({
    hours: 0,
    minutes: 0,
  });
  const [actualTotal, setActualTotal] = useState<{ hours: number; minutes: number }>({
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const fetchBoardDetails = async () => {
      if (!boardId) return;

      try {
        // Fetch board name
        const boardDocRef = doc(db, "Boards", boardId);
        const boardDoc = await getDoc(boardDocRef);

        if (boardDoc.exists()) {
          const boardData = boardDoc.data();
          setBoardName(boardData?.boardname || "Unnamed Board");
        }

        // Fetch all cards for the board
        const cardsRef = collection(db, "Cards");
        const cardsQuery = query(cardsRef, where("boardID", "==", boardId));
        const querySnapshot = await getDocs(cardsQuery);

        // Calculate totals
        let estimatedHours = 0;
        let estimatedMinutes = 0;
        let actualHours = 0;
        let actualMinutes = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.estimatedHours != null) estimatedHours += data.estimatedHours;
          if (data.estimatedMinutes != null) estimatedMinutes += data.estimatedMinutes;
          if (data.actualHours != null) actualHours += data.actualHours;
          if (data.actualMinutes != null) actualMinutes += data.actualMinutes;
        });

        // Convert minutes to hours where applicable
        estimatedHours += Math.floor(estimatedMinutes / 60);
        estimatedMinutes = estimatedMinutes % 60;
        actualHours += Math.floor(actualMinutes / 60);
        actualMinutes = actualMinutes % 60;

        setEstimatedTotal({ hours: estimatedHours, minutes: estimatedMinutes });
        setActualTotal({ hours: actualHours, minutes: actualMinutes });
      } catch (error) {
        console.error("Error fetching board details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardDetails();
  }, [boardId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!boardId) {
    return <p>Board not found</p>;
  }

  return (
    <div>
      <header>
        <h1>{boardName}</h1>
        <h2 className="estimatedTotal">
          Estimated time: {estimatedTotal.hours} h and {estimatedTotal.minutes} minutes
        </h2>
        <h2 className="actualTotal">
          Actual time: {actualTotal.hours} h and {actualTotal.minutes} minutes
        </h2>
      </header>
      <div className={styles.lists} content="width=device-width, initial-scale=1">
        <AddLists boardId={boardId}/>
        <Lists boardId={boardId} />
      </div>
    </div>
  );
};

export default Board;
