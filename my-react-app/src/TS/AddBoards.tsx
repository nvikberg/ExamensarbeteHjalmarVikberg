import React, { useState, useEffect } from 'react';
import { db } from "../Data/firebase";
import { collection, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import styles from '../CSS/AddBoard.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MultipleUsersToBoards from './MultipleUsersToBoards';


//ATT GÖRA - "user id" ska följa med när man skapar en ny tavla och även att "board title" läggs till under den usern

//typescript grej att definera typer för state
interface Board {
  boardname: string;
  userID: string;

}

const AddBoards: React.FC = () => {
  const [user, setUser] = useState<any>('')
  const [boardName, setBoardName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [boards, setBoards] = useState<Board[]>([]); //boardsen som är associerade med usern

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log(user)
      } else {
        setUser('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBoardName(e.target.value);
  };

  //lägga till en ny anslagstavla i firestore
  const addBoard = async (): Promise<void> => {
    if (!boardName.trim()) {
      alert('Please enter a valid board name!');
      return;
    }


    if (!user) {
      alert('You must be logged in to add a board.');
      return;
    }

    try {
      setLoading(true);

      //Lägger till nytt doc med namn (user input)
      const docRef = await addDoc(collection(db, "Boards"), {
        boardname: boardName,
        userID: user.uid
      });

      const userRef = doc(db, "Users", user.uid); // Reference to the user's document
      await updateDoc(userRef, {
        boardID: arrayUnion(docRef.id) //`arrayUnion` to add the board ID to the boardIds array(arrayUnion FÖR FIREBASE)
      });

      setLoading(false);
      setSuccessMessage(`Document written with ID: ${docRef.id}`);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      setLoading(false);
      console.error("Error adding document: ", error);
      alert("An error occurred while adding the board.");
    }
  };

  return (
    // <div className={styles.main}>

    <div className={styles.sidebar}>
      <div className={styles.boardHeader}>
        <h2>Add new board</h2>
      </div>
      <div>
        <input
          className={styles.input}
          type="text"
          value={boardName}
          onChange={handleInputChange}
          placeholder="Enter board name"
        />
        <button
          className={styles.addBoardButton}
          onClick={addBoard} disabled={loading}>
          {loading ? "Adding Board..." : "+"}
        </button>
      </div>
      <div>
      <MultipleUsersToBoards></MultipleUsersToBoards>

      </div>
      {successMessage && <p>{successMessage}</p>}
    </div>
    
    // </div>

  );
};

export default AddBoards;
