import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import styles from '../CSS/Card.module.css'; 

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

interface CardsComponentProps {
  boardId: string;
  listTitle: string;
  cards: CardData[]; 
}

const CardsComponent: React.FC<CardsComponentProps> = ({ cards: initialCards, boardId, listTitle }) => {
  const [cards, setCards] = useState<CardData[]>(initialCards); // Initializing state with the passed prop
  const [loading, setLoading] = useState(true);
  const [estHour, setEstHour] = useState<number | null>(null);
  const [estMin, setEstMin] = useState<number | null>(null);
  const [actHour, setActHour] = useState<number | null>(null);
  const [actMin, setActMin] = useState<number | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = collection(db, 'Cards');

        const q = query(
          cardsRef,
          where('boardID', '==', boardId), // Using destructured `boardId`
          where('listtitle', '==', listTitle) // Using destructured `listTitle`
        );

        const querySnapshot = await getDocs(q);

        const fetchedCards: CardData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          cardtext: doc.data().cardtext,
          boardID: doc.data().boardID,
          listtitle: doc.data().listtitle,
          estimatedHours: doc.data().estimatedHours ?? null,
          estimatedMinutes: doc.data().estimatedMinutes ?? null,
          actualHours: doc.data().actualHours ?? null,
          actualMinutes: doc.data().actualMinutes ?? null,
          ...doc.data(),
        }));

        setCards(fetchedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [boardId, listTitle]); // Dependency array includes `boardId` and `listTitle`

  const handleSaveTimeEstimation = async (cardId: string) => {
    if (estHour === null && estMin === null) {
      alert('Please provide either hours or minutes');
      return;
    }

    try {
      const cardDocRef = doc(db, 'Cards', cardId);

      await updateDoc(cardDocRef, {
        estimatedHours: estHour,
        estimatedMinutes: estMin,
      });

      alert('Time estimation saved successfully!');
      setEstHour(null);
      setEstMin(null);
    } catch (error) {
      console.error('Error adding time estimate:', error);
      alert('Failed to save time estimation. Please try again.');
    }
  };

  const handleSaveActualTime = async (cardId: string) => {
    if (actHour === null && actMin === null) {
      alert('Please provide either hours or minutes');
      return;
    }

    try {
      const cardDocRef = doc(db, 'Cards', cardId);

      await updateDoc(cardDocRef, {
        actualHours: actHour,
        actualMinutes: actMin,
      });

      alert('Actual time saved successfully!');
      setActHour(null);
      setActMin(null);
    } catch (error) {
      console.error('Error adding actual time:', error);
      alert('Failed to save actual time. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading cards...</p>;
  }

  const handleDragCardStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => {
    event.stopPropagation(); // Prevent interference with list dragging
    event.dataTransfer.setData("cardId", cardId);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      {cards.length > 0 && (
        <div className={styles.cardContainer}>
          <ul className={styles.cardList}>
            {cards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                className={styles.card}
                draggable="true"
                onDragStart={(event) => handleDragCardStart(event, card.id)}
              >
                <p>{card.cardtext}</p>
                {card.estimatedHours != null && <p>{card.estimatedHours} h</p>}
                {card.estimatedMinutes != null && <p>{card.estimatedMinutes} min</p>}
                {card.actualHours != null && <p>{card.actualHours} h</p>}
                {card.actualMinutes != null && <p>{card.actualMinutes} min</p>}
                <div className={styles.timeEstimation}>
                  <p>Estimated time for task:</p>
                  <input
                    type="number"
                    className={styles.estHour}
                    placeholder="Hours"
                    value={estHour ?? ''}
                    onChange={(e) => setEstHour(Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className={styles.estMin}
                    placeholder="Minutes"
                    value={estMin ?? ''}
                    onChange={(e) => setEstMin(Number(e.target.value))}
                  />
                  <button onClick={() => handleSaveTimeEstimation(card.id)}>
                    Save time estimation
                  </button>
                  <p>Actual time:</p>
                  <input
                    type="number"
                    className={styles.actHour}
                    placeholder="Hours"
                    value={actHour ?? ''}
                    onChange={(e) => setActHour(Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className={styles.actMin}
                    placeholder="Minutes"
                    value={actMin ?? ''}
                    onChange={(e) => setActMin(Number(e.target.value))}
                  />
                  <button onClick={() => handleSaveActualTime(card.id)}>
                    Save actual time
                  </button>
                </div>
              </div>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default CardsComponent;
