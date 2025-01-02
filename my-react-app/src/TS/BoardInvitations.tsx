import React, { useState, useEffect } from 'react';
import { db } from "../Data/firebase";
import { getDocs, doc, collection, addDoc, updateDoc, arrayUnion, query, where } from "firebase/firestore";
import '../CSS/BoardInvitation.css'
import { getAuth, onAuthStateChanged } from 'firebase/auth';


interface InvitationProps {
    boardID: string;  //board id som user är inbjuden till
    boardname: string; 
    onAccept: () => void;  
    onDeny: () => void; 
  }
  

const BoardInvitations: React.FC<InvitationProps> = ({ boardID, boardname, onAccept, onDeny }) => {
    const [user, setUser] = useState<any>(null); 
    const auth = getAuth();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user); 
        }else{
            setUser(null);  
        }
      });

    // Cleanup subscription when component unmounts
    return () => unsubscribe();
}, [auth]);

const handleAccept = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const boardRef = doc(db, "Boards", boardID);
      
      // Update the member's status to accepted in the 'members' sub-collection
      await updateDoc(boardRef, {
        members: arrayUnion({
          userID: user.uid,
          status: 'accepted',  // You can use "pending", "accepted", or "denied" status
        })
      });

      // Call the onAccept callback function passed as prop
      onAccept();

      console.log("Invitation accepted!");

    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleDeny = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      // Get reference to the board document
      const boardRef = doc(db, "Boards", boardID);

      // Update the member's status to denied in the 'members' sub-collection
      await updateDoc(boardRef, {
        members: arrayUnion({
          userId: user.uid,
          status: 'denied',  // Update status to "denied"
        })
      });

      // Call the onDeny callback function passed as prop
      onDeny();

      console.log("Invitation denied!");

    } catch (error) {
      console.error("Error denying invitation:", error);
    }
  };

    return (
        <div className="invitation-modal">
          <div className="invitation-content">
            <h2>Invitation to join "{boardname}"</h2>
            <p>You have been invited to join this board. Do you accept?</p>
            <div className="invitation-buttons">
              <button className="accept-btn" onClick={handleAccept}>Accept</button>
              <button className="deny-btn" onClick={handleDeny}>Deny</button>
            </div>
          </div>
        </div>
      );
    };

export default BoardInvitations;
