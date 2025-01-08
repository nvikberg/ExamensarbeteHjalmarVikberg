import React, { useState } from 'react';
import { db } from '../Data/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CardData {
  boardID: string;
  cardtext: string;
  listtitle: string;
  userID: string;
}

interface BoardProps {
  boardId: string;
  listTitle: string; 
  userId: string;
}

const AddCards: React.FC<BoardProps> = ({ boardId, listTitle, userId }) => {
  const [cardText, setCardText] = useState('');
   const [alertMessage, setAlertMessage] = useState<string>('');
  
        
  const handleAddCard = async () => {
    if (!cardText) {
      setAlertMessage(`Enter card text`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);

      return;
    }

    try {
      const newCard: CardData = {
        boardID: boardId,
        cardtext: cardText,
        listtitle: listTitle,
        userID: userId,
      };

      // Save the card to Firestore
      await addDoc(collection(db, 'Cards'), newCard);

      // Clear the input field
      setCardText('');
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter card text"
        value={cardText}
        onChange={(e) => setCardText(e.target.value)}
      />
      <button onClick={handleAddCard}>Add Card</button>
    </div>
  );
};

export default AddCards;
