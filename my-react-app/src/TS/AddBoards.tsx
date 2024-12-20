import React, { useState } from 'react';
import { db } from "../Data/firebase"; 
import { collection, addDoc } from "firebase/firestore";  

//typescript grej att definera typer för state
interface Board {
  boardname: string;
}

const AddBoards: React.FC = () => {
  const [boardName, setBoardName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setBoardName(e.target.value);
  };

  //lägga till en ny anslagstavla i firestore
  const addBoard = async (): Promise<void> => {
    if (!boardName.trim()) {
      alert('Please enter a valid board name!');
      return;
    }

    try {
      setLoading(true); 

      //Lägger till nytt doc med namn (user input)
      const docRef = await addDoc(collection(db, "Boards"), {
        boardname: boardName
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
    <div>
      <h2>Add New Board</h2>
      <input
        type="text"
        value={boardName}
        onChange={handleInputChange}
        placeholder="Enter board name"
      />
      <button onClick={addBoard} disabled={loading}>
        {loading ? "Adding Board..." : "Add Board"}
      </button>

      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default AddBoards;
