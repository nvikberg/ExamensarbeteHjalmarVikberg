import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = collection(db, 'Cards');

        // Kollar efter matchande boardId och Lista
        const q = query(
          cardsRef,
          where('boardID', '==', boardId),
          where('listtitle', '==', listTitle)
        );

        const querySnapshot = await getDocs(q);

        // Mappar resultatet till en array
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
  }, [boardId, listTitle]); //Kör om vid ändringar

  if (loading) {
    return <p>Loading cards...</p>;
  }

  

  return (
    <>
      {cards.length > 0 && (
        <div className="card-container">
          <ul>
            {cards.map((card) => (
              <div key={card.id}>{card.cardtext}</div>
            ))}
          </ul>
          <p>Estimated time for task: </p>
          <input type="number" className="estHour" placeholder="Hours"></input>
          <input type="number" className="estMin" placeholder="Minutes"></input>
        </div>
      )}
    </>
  );  
}
  

export default CardsComponent;
