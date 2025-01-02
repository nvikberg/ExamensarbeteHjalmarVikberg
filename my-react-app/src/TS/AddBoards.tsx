import React, { useState, useEffect } from 'react';
import { db } from "../Data/firebase";
import { getDocs, doc, collection, addDoc, updateDoc, arrayUnion, query, where } from "firebase/firestore";
import styles from '../CSS/AddBoard.module.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MultipleUsersToBoards from './MultipleUsersToBoards';


//ATT GÖRA, EFFEKTIVISERA HUR MAN LÄGGER IN board id hos USERS (loopen rad 78)

interface Board {
  boardname: string;
  userID: string;
}

const AddBoards: React.FC = () => {
  const [user, setUser] = useState<any>('')
  const [boardname, setBoardname] = useState<string>('');
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
    setBoardname(e.target.value);
  };

  //lägger till vald member till statet
  const handleSelectMembers = (members: string[]): void => {
    setSelectedMembers(members);
  };

  //lägga till en ny anslagstavla i firestore
  const addBoard = async (): Promise<void> => {
    if (!boardname.trim()) {
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
        boardname: boardname,
        userID: user.uid,
        members: [...selectedMembers, user.email],//sparar usern som skapade baorden och inbjudna usern i ny row i dbn
      });

      console.log("Board created with ID", docRef.id);
      console.log("Selected members", selectedMembers);

      //loopar igenom alla medlemmar och lägger till board ID till deras docs också
      for (const memberEmail of selectedMembers) {
        console.log("sending invitation to", memberEmail);

        const memberQuery = query(collection(db, "Users"), where("userEmail", "==", memberEmail));
        const memberSnapshot = await getDocs(memberQuery);

        //hämtar informationen om inbjudna usern för att använda i invitation doc
        if (!memberSnapshot.empty) {
          const memberDoc = memberSnapshot.docs[0];
          const memberData = memberDoc.data();
          const memberID = memberDoc.id;

          //skapar invitations i db
          await addDoc(collection(db, "Invitations"), {
            boardID: docRef.id,
            senderID: user.uid,
            receiverID: memberID,
            status: "pending", // Initial status is pending
            timestamp: new Date(),
          });

          console.log(`Invitation sent to ${memberEmail}`);
          alert('Invitation sent to' + memberEmail)
        }
      }

      //lägger till boardID i current User
      const userRef = doc(db, "Users", user.uid); // Reference to the user's document
      await updateDoc(userRef, {
        boardID: arrayUnion(docRef.id) //`arrayUnion` to add the board ID to the boardIds array(arrayUnion FÖR FIREBASE)
      });


      setLoading(false);
      setSuccessMessage(`Board added with ID ${docRef.id}`);
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message after 3 seconds
      }, 3000);

      //clearar staten så det är tomt på front enden efter det blivit adderad till db
      setBoardname('');
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
          value={boardname}
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
