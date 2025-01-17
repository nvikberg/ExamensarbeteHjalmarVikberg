import React, { useState } from 'react';
import { db } from '../../Data/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import styles from '../../CSS/Lists.module.css'
import boardStyles from '../../CSS/BoardPage.module.css'
interface ListProps {
  boardId: string;
}

const AddLists: React.FC<ListProps> = ({ boardId }) => {
  const [newListTitle, setNewListTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('')

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      setSuccessMessage(`Please enter list title`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return;
    }

    setLoading(true);
    try {
      const boardDocRef = doc(db, 'Boards', boardId);

      await updateDoc(boardDocRef, {
        listTitle: arrayUnion(newListTitle),
      });
      setNewListTitle('');
    } catch (error) {
      console.error('Error adding list:', error);
      setSuccessMessage('Could not add list. Please try again later.');
      // alert('Could not add list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.listCard}>
        <h3 className={styles.addListCardHeader}>Create a New List</h3>
        <form>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter list title"
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          disabled={loading}
        />
        <button className={styles.addBoardButton} onClick={handleAddList} disabled={loading}>
          {loading ? 'Adding...' : 'Add List'}
        </button>
        </form>
        {successMessage && <p className={successMessage}>{successMessage}</p>}
      </div>
      <div className={boardStyles.header}>
        <div className={styles.dropTextDiv}>
        <p className={styles.cardHoverText}><p>Pssst..</p>
        Move list: <br></br>Drag n drop over the List title area</p>
        <p className={styles.cardHoverText}>Move card:<br></br> Drag n drop over the cards area </p>
        </div>
          </div>
    </div>
  );
};

export default AddLists;
