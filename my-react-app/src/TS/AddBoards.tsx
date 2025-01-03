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
  const [user, setUser] = useState<any>('') // The currently logged-in user
  const [boardname, setBoardname] = useState<string>(''); // Board name input from user
  const [loading, setLoading] = useState<boolean>(false); // Loading state for the button
  const [successMessage, setSuccessMessage] = useState<string>(''); // Success message to show after board creation
  const [boards, setBoards] = useState<Board[]>([]); // Boards associated with the user
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // Selected user emails for the task

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log(user)
      } else {
        setUser(''); // User is logged out
      }
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [auth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBoardname(e.target.value); // Update the board name when the input changes
  };

  // Lägg till vald member till statet
  const handleSelectMembers = (members: string[]): void => {
    setSelectedMembers(members); // Update selected members for the board
  };

  // Lägg till en ny anslagstavla i firestore
  const addBoard = async (): Promise<void> => {
    if (!boardname.trim()) {
      alert('Please enter a valid board name!');
      return;
    }
    if (!user) {
      alert('You must be logged in to add a board.');
      return;
    }

    setLoading(true); // Set loading to true while the operation is in progress

    try {
      // Lägg till nytt doc med namn (user input)
      const docRef = await addDoc(collection(db, "Boards"), {
        boardname: boardname,
        userID: user.uid,
        members: [user.email], // Sparar usern som skapade baorden och inbjudna usern i ny row i dbn
      });

      console.log("Board created with ID", docRef.id);
      console.log("Selected members", selectedMembers);

      // Loopar igenom alla medlemmar och lägger till board ID till deras docs också
      for (const memberEmail of selectedMembers) {
        console.log("sending invitation to", memberEmail);

        const memberQuery = query(collection(db, "Users"), where("email", "==", memberEmail));
        const memberSnapshot = await getDocs(memberQuery);

        // Hämtar informationen om inbjudna usern för att använda i invitation doc
        if (!memberSnapshot.empty) {
          const memberDoc = memberSnapshot.docs[0];
          // const memberData = memberDoc.data();
          const memberID = memberDoc.id;

          // Skapar invitation för varje medlem
          await createInvitation(docRef.id, user.uid, memberID);
        }
      }

      // Lägg till boardID i current User
      const userRef = doc(db, "Users", user.uid); // Reference to the user's document
      await updateDoc(userRef, {
        boardID: arrayUnion(docRef.id), // `arrayUnion` to add the board ID to the boardIds array (arrayUnion FÖR FIREBASE)
      });

      setLoading(false); // Set loading to false once the operation is complete
      setSuccessMessage(`Board added with ID ${docRef.id}`); // Set success message
      setTimeout(() => {
        setSuccessMessage(''); // Clear the success message after 3 seconds
      }, 3000);

      // Clear the form fields after the board has been added to the DB
      setBoardname('');
      setSelectedMembers([]);

    } catch (error) {
      setLoading(false); // Set loading to false in case of error
      console.error("Error adding document: ", error);
      alert("An error occurred while adding the board.");
    }
  };

  // Function to create an invitation document for a member
  const createInvitation = async (boardID: string, senderID: string, receiverID: string) => {
    try {
      // Skapar invitations i db
      await addDoc(collection(db, "Invitations"), {
        boardID: boardID,
        senderID: senderID,
        receiverID: receiverID,
        status: "pending", // Initial status is pending
        timestamp: new Date(),
      });

      console.log(`Invitation sent to ${receiverID}`);
    } catch (error) {
      console.error("Error sending invitation:", error);
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
