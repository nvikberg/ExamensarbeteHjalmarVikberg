import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import '../CSS/Card.css';

interface CardData {
  id: string;
  cardtext: string;
  boardID: string;
  listtitle: string;
}

interface CardsComponentProps {
  boardId: string;
  listTitle: string;
}

const CardsComponent: React.FC<CardsComponentProps> = ({ boardId, listTitle }) => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [estHour, setEstHour] = useState<number | null>(null);
  const [estMin, setEstMin] = useState<number | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = collection(db, 'Cards');

        // Query for matching boardId and listTitle
        const q = query(
          cardsRef,
          where('boardID', '==', boardId),
          where('listtitle', '==', listTitle)
        );

        const querySnapshot = await getDocs(q);

        // Map query results to an array
        const fetchedCards: CardData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          cardtext: doc.data().cardtext,
          boardID: doc.data().boardID,
          listtitle: doc.data().listtitle,
        }));

        setCards(fetchedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [boardId, listTitle]);

  const handleSaveTimeEstimation = async (cardId: string) => {
    if (estHour === null || estMin === null) {
      alert('Please provide both estimated hours and minutes');
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

  if (loading) {
    return <p>Loading cards...</p>;
  }

  return (
    <>
      {cards.length > 0 && (
        <div className="card-container">
          <ul>
            {cards.map((card) => (
              <div key={card.id} className="card">
                <p>{card.cardtext}</p>
                <div className="time-estimation">
                  <p>Estimated time for task: </p>
                  <input
                    type="number"
                    className="estHour"
                    placeholder="Hours"
                    value={estHour ?? ''}
                    onChange={(e) => setEstHour(Number(e.target.value))}
                  />
                  <input
                    type="number"
                    className="estMin"
                    placeholder="Minutes"
                    value={estMin ?? ''}
                    onChange={(e) => setEstMin(Number(e.target.value))}
                  />
                  <button onClick={() => handleSaveTimeEstimation(card.id)}>
                    Save time estimation
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
