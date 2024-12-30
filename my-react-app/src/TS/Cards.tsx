import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
    <div>
      {cards.length > 0 ? (
        <ul>
          {cards.map((card) => (
            <li key={card.id}>{card.cardtext}</li>
          ))}
        </ul>
      ) : (
        <p> </p>
      )}
    </div>
  );
};

export default CardsComponent;
