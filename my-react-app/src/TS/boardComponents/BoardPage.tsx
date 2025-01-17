import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../Data/firebase";
import { updateDoc, collection, query, where, getDocs, getDoc, doc, onSnapshot } from "firebase/firestore";
import Lists from "../listComponents/Lists";
import AddLists from "../listComponents/AddList";
import styles from "../../CSS/BoardPage.module.css"
import SeasonalPhoto from "../API";

//Boardpage är sidan som visar varje enskild tavla
//här kan man lägga till listor och kort på sin tavla
//man kan välja medlemmar som är med i tavlan och 
//man kan lägga tidestimering på korten som sedan syns i helhet på headern
//man kan också välja bakgrundsbild som sparas i databasen

const Board: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardName, setBoardName] = useState<string>("");
  const [lists, setLists] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [estimatedTotal, setEstimatedTotal] = useState<{ hours: number; minutes: number }>({
    hours: 0,
    minutes: 0,
  });
  const [actualTotal, setActualTotal] = useState<{ hours: number; minutes: number }>({
    hours: 0,
    minutes: 0,
  });



  useEffect(() => {
    if (!boardId) return;

    setLoading(true);

    const boardDocRef = doc(db, "Boards", boardId);
    const cardsRef = collection(db, "Cards");
    const cardsQuery = query(cardsRef, where("boardID", "==", boardId));

    // Single snapshot listener for both board name and lists
    const unsubscribeBoard = onSnapshot(boardDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const boardData = docSnapshot.data();
        setBoardName(boardData.boardname || "Unnamed Board");
        setLists(boardData.listTitle || []);  // Update both lists and board name
        setBackgroundImage(boardData.backgroundImage || ''); //bakgrund från db

      }
    }, (error) => {
      console.error("Error fetching board data:", error);
    });

    // Separate listener for cards to calculate totals
    const unsubscribeCards = onSnapshot(cardsQuery, (querySnapshot) => {
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
      setLoading(false);
    }, (error) => {
      console.error("Error fetching card data:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeBoard();
      unsubscribeCards();
    };
  }, [boardId]);

  const handleBackgroundImageSelection = async (selectedImage: string) => {
    setBackgroundImage(selectedImage);

    if (!boardId) return;

    try {
      const boardDocRef = doc(db, "Boards", boardId);
      await updateDoc(boardDocRef, {
        backgroundImage: selectedImage, //sparar till db
      });
    } catch (error) {
      console.error("Error updating background image:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!boardId) {
    return <p>Board not found</p>;
  }


  return (
    <div className={styles.board} style={{
      backgroundImage: backgroundImage ? `url("${encodeURI(backgroundImage)}")` : 'none',
    }} >
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>{boardName}</h1>
          <div>
            <h2 className={styles.estimatedTotal}> Estimated time: {estimatedTotal.hours} h and {estimatedTotal.minutes} minutes</h2>
            <h2 className={styles.actualTotal}> Actual time: {actualTotal.hours} h and {actualTotal.minutes} minutes </h2>
          </div>
        </div>
      </header>
      <div className={styles.boardMainContent}>
        <SeasonalPhoto onPhotosFetched={(photos: string[]) => handleBackgroundImageSelection(photos[0])} />
        <ol className={styles.listWrapper}>
          <AddLists boardId={boardId}></AddLists>
          
          <div className={styles.lists}>
            <Lists boardId={boardId} />
          </div>
        </ol>
      </div>
    </div>
  );
};

export default Board;
