import React, { useState, useEffect } from 'react';
import { db } from "../Data/firebase";
import { getDocs, doc, collection, addDoc, updateDoc, arrayUnion, query, where } from "firebase/firestore";
import styles from '../CSS/AddBoard.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MultipleUsersToBoards from './MultipleUsersToBoards';


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
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Selected user IDs for the task

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

  //lägger till vald member till statet
  const handleSelectMembers = (members: string[]): void => {
    setSelectedMembers(members);
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
        userID: user.uid,
        members: [...selectedMembers, user.email], //sparar medlemmar i ny row i dbn
      });

      //lägger till boardID i current User
      const userRef = doc(db, "Users", user.uid); // Reference to the user's document
      await updateDoc(userRef, {
        boardID: arrayUnion(docRef.id) //`arrayUnion` to add the board ID to the boardIds array(arrayUnion FÖR FIREBASE)
      });


      //loopar igenom alla medlemmar och lägger till board ID till deras docs också
      for (const memberEmail of selectedMembers) {
        const memberQuery = query(collection(db, "Users"), where("userEmail", "==", memberEmail));
        const memberSnapshot = await getDocs(memberQuery);

        memberSnapshot.forEach(async (doc) => {
          const memberRef = doc.ref; //userdoc ref
          await updateDoc(memberRef, {
            boardID: arrayUnion(docRef.id) //adderar boardID till den usersn boardID array
          });
        });
      }

      setLoading(false);
      alert('Board added!')
      setSuccessMessage(`Document written with ID: ${docRef.id}`);
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message after 3 seconds
      }, 3000);

      //clearar staten så det är tomt på front enden efter det blivit adderad till db
      setBoardName('');
      setSelectedMembers([]);


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
        <MultipleUsersToBoards
          selectedMembers={selectedMembers}
          onSelectMembers={handleSelectMembers}
        />

      </div>
      {successMessage && <p>{successMessage}</p>}
    </div>

    // </div>

  );
};

export default AddBoards;
