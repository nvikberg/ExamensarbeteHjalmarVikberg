import React, { useEffect, useState } from 'react';
import { db } from "../Data/firebase";
import { getDocs, getDoc, collection, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Board from './BoardPage';
//ATT GÖRA MAN SKA INTE KUNNA SKCKA INBJUDAN TILL SIG SJÄLV
//NU funkar det som det ska förutom att man sparas som en member i Board collection direct man blir inbjuden till en board
//ps. faktiska Skapa invitation doc till firebase ligger i AddBoards komponenten

//användare kan ta emot och hantera inbjudning till en board
//den hämtar från invitations colleciton i db "reciever id" som matchar userID 
// och sedan displayar dem som har status "pending" i inbox

interface Invitation {
  id: string;
  boardID: string;
  boardname: string;
  senderID: string;
  senderEmail: string;
  receiverID: string;
  status: string;
  timestamp: string;
}

const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [user, setUser] = useState<any>(null);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchInvitations(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  const fetchInvitations = async (userID: string) => {
    const invitationsQuery = query(
      collection(db, "Invitations"),
      where("receiverID", "==", userID),
      where("status", "==", "pending")
    );

    //loopar igenom docs och uppdaterar listan med inbjudningar
    const querySnapshot = await getDocs(invitationsQuery);
    const invitationsList: Invitation[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const invitation = docSnap.data();

      //hämtar board name från boards
      const boardRef = doc(db, "Boards", invitation.boardID);
      const boardSnap = await getDoc(boardRef);
      const boardname = boardSnap.exists() ? boardSnap.data().boardname : 'No Board';

      
      //hämtar email från senderID (userID)
      const senderRef = doc(db, "Users", invitation.senderID);
      const senderSnap = await getDoc(senderRef);
      const senderEmail = senderSnap.exists() ? senderSnap.data().email : 'Unknown sender';


      invitationsList.push({
        id: docSnap.id,
        boardID: invitation.boardID,
        boardname: boardname,
        senderID: invitation.senderID,
        senderEmail: senderEmail,
        receiverID: invitation.receiverID, 
        status: invitation.status,
        timestamp: invitation.timestamp,
      });
    };
    setInvitations(invitationsList);
  };

  //hanterar statusen och adderar users email till members fältet i Boards
  const handleAccept = async (invitation: Invitation, boardID: string) => {
    if (invitation.status !== "pending") {
      console.log("Invitation has already been responded to.");
      return;
    }
    
    try {
      const invitationRef = doc(db, "Invitations", invitation.id);
      await updateDoc(invitationRef, {
        status: "accepted",
      });

      const boardRef = doc(db, "Boards", boardID);
      await updateDoc(boardRef, {
        members: arrayUnion(user.email),
      });

      const receiverRef = doc(db, "Users", invitation.receiverID);  // Use invitation.receiverID for the receiver's UID
      await updateDoc(receiverRef, {
        boardID: arrayUnion(boardID),
      });

      console.log("Invitation accepted!");
      setAlertMessage('You accepted the invitation to board' + invitation.senderEmail);
      setTimeout(() => { setAlertMessage(''); } , 3000);  
      fetchInvitations(user.uid); //refresh inbox
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }

  };

  const handleDeny = async (invitationID: string) => {
    try {
      const invitationRef = doc(db, "Invitations", invitationID);
      await updateDoc(invitationRef, {
        status: "denied",
      });
      setAlertMessage('You denied the invitation to board' );
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);  
      console.log("Invitation denied!");
      fetchInvitations(user.uid); //refresh inbox
    } catch (error) {
      console.error("Error denying invitation:", error);
    }
  };

  return (
    <div>
      <h2>Your Invitations</h2>
      {invitations.length > 0 ? (
        invitations.map((invitation) => (
          <div key={invitation.id}>
            <h3>Invitation to join board: {invitation.boardname}</h3>
            <p>Sent from: {invitation.senderEmail}</p>
            <button onClick={() => handleAccept(invitation, invitation.boardID)}>Accept</button>
            <button onClick={() => handleDeny(invitation.id)}>Deny</button>
          </div>
        ))
      ) : (
        <p>No invitations pending</p>
      )}
    </div>
  );
};

export default Invitations;
