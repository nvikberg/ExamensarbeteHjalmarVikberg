import React, { useState } from 'react';
import { db } from '../Data/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface ListProps {
  boardId: string;
}

const AddLists: React.FC<ListProps> = ({ boardId }) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      alert('Please fill in a list title');
      return;
    }

    setLoading(true);
    try {
      const boardDocRef = doc(db, 'Boards', boardId);

      await updateDoc(boardDocRef, {
        listTitle: arrayUnion(newListTitle),
      });

      alert('List added successfully!');
      setNewListTitle(''); 
    } catch (error) {
      console.error('Error adding list:', error);
      alert('Could not add list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Add a New List</h3>
      <input
        type="text"
        placeholder="Enter list title"
        value={newListTitle}
        onChange={(e) => setNewListTitle(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleAddList} disabled={loading}>
        {loading ? 'Adding...' : 'Add List'}
      </button>
    </div>
  );
};

export default AddLists;
