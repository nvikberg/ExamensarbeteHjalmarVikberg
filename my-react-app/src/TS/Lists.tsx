import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, doc, getDoc, getDocs, query, updateDoc, where, onSnapshot } from 'firebase/firestore';
import styles from "../CSS/Lists.module.css"
import CardsComponent from './Cards';
import AddCards from './AddCard';
import { getAuth } from 'firebase/auth';
import DeleteLists from './DeleteList';
import Board from './BoardPage';

interface CardData {
  id: string;
  cardtext: string;
  boardID: string;
  listtitle: string;
  estimatedHours?: number | null;
  estimatedMinutes?: number | null;
  actualHours?: number | null;
  actualMinutes?: number | null;
}

interface BoardData {
  id: string;
  listTitle: string;
  cards: CardData[];
}

interface BoardProps {
  boardId: string;
}

const Lists: React.FC<BoardProps> = ({ boardId }) => {
  const [lists, setLists] = useState<BoardData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [cardIsDraggedOver, setCardIsDraggedOver] = useState<boolean>(false);
  const [listIsDraggedOver, setListIsDraggedOver] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setUserId(user ? user.uid : null);

    const boardDocRef = doc(db, 'Boards', boardId);

    //lyssnare på uppdateringar om en ny lista är addad på db 
    const unsubscribe = onSnapshot(boardDocRef, (boardDoc) => {
      if (boardDoc.exists()) {
        const boardData = boardDoc.data();
        const listTitles = boardData?.listTitle || [];

        const fetchedLists: BoardData[] = listTitles.map((title: string, index: number) => ({
          id: `${boardId}-list-${index}`,
          listTitle: title,
          cards: [],
        }));

        setLists(fetchedLists);
      } else {
        console.error("Board not found");
      }
    });

    //stoppa lyssnaren
    return () => unsubscribe();
  }, [boardId]);

  if (!userId) {
    return <p>Loading user information...</p>;
  }

  const handleListDragStart = (event: React.DragEvent<HTMLDivElement>, listId: string) => {
    event.stopPropagation();
    event.dataTransfer.setData("draggedListId", listId);
    setListIsDraggedOver(listId);
  };

  const handleListDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setListIsDraggedOver(null);
  };

  const handleListDragOver = (event: React.DragEvent<HTMLDivElement>, listId: string) => {
    event.preventDefault();
    setListIsDraggedOver(listId);
  };

  const handleListDrop = (event: React.DragEvent<HTMLDivElement>, targetListId: string) => {
    event.preventDefault();
    const draggedListId = event.dataTransfer.getData("draggedListId");
    setListIsDraggedOver(null);

    if (!draggedListId) return;

    const newOrder = [...lists];
    const draggedIndex = newOrder.findIndex((list) => list.id === draggedListId);
    const targetIndex = newOrder.findIndex((list) => list.id === targetListId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);

      setLists(newOrder);
    }
  };

  const handleCardDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setCardIsDraggedOver(true);
  };

  const handleCardDragLeave = () => {
    setCardIsDraggedOver(false);
  };

  const handleCardDrop = async (event: React.DragEvent<HTMLDivElement>, newListTitle: string) => {
    event.preventDefault();
    event.stopPropagation();
    setCardIsDraggedOver(false);
    setListIsDraggedOver(null);

    const cardId = event.dataTransfer.getData("cardId");
    if (!cardId) {
      console.error("No cardId found in dataTransfer");
      return;
    }

    try {
      const cardDocRef = doc(db, "Cards", cardId);
      await updateDoc(cardDocRef, {
        listtitle: newListTitle,
      });

      // After the Firestore update, refetch the lists data to ensure it's up to date
      const fetchCards = async () => {
        try {
          const cardsRef = collection(db, "Cards");
          const q = query(cardsRef, where("boardID", "==", boardId));
          const querySnapshot = await getDocs(q);

          const fetchedCards: CardData[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as CardData[];

          setLists((prevLists) =>
            prevLists.map((list) => ({
              ...list,
              cards: fetchedCards.filter((card) => card.listtitle === list.listTitle),
            }))
          );
        } catch (error) {
          console.error("Error fetching cards:", error);
        }
      };

      await fetchCards();
      console.log(`Card ${cardId} successfully moved to list ${newListTitle}`);
    } catch (error) {
      console.error("Error updating card:", error);
    }
  };

  if (lists.length === 0) {
    return <p>Create a list!</p>;
  }

  return (
    <div className={styles.listsContainer}>
      {lists.map((list) => (
        <div
          key={list.id}
          className={`${styles.listCard} ${listIsDraggedOver === list.id ? styles.listHighlight : ''}`}
          draggable="true"
          onDragStart={(event) => handleListDragStart(event, list.id)}
          onDrop={(event) => handleListDrop(event, list.id)}
          onDragLeave={handleListDragLeave}
          onDragOver={(event) => handleListDragOver(event, list.id)}
        >
          <div>
            <h3 className={styles.listTitle}>{list.listTitle}</h3>
            <DeleteLists boardId={boardId} listtitle={list.listTitle} />
          </div>
          <div
            className={`${styles.cardContainer} ${cardIsDraggedOver ? styles.cardHighlight : ''}`}
            onDragOver={handleCardDragOver}
            onDragLeave={handleCardDragLeave}
            onDrop={(event) => handleCardDrop(event, list.listTitle)}
          >
            <CardsComponent boardId={boardId} listTitle={list.listTitle} cards={list.cards} />
            <AddCards boardId={boardId} listTitle={list.listTitle} userId={userId} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Lists;
