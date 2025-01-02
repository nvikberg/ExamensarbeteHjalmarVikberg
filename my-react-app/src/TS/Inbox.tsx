import React, { useEffect, useState } from 'react';
import { db } from "../Data/firebase";
import { getDocs, collection, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
//ATT GÖRA MAN SKA INTE KUNNA SKCKA INBJUDAN TILL SIG SJÄLV


//användare kan ta emot och hantera inbjudning till en board
//den hämtar från invitations colleciton i db "reciever id" som matchar userID 
// och sedan displayar dem som har status "pending"

interface Invitation {
  id: string;
  boardID: string;
  senderID: string;
  status: string;
  timestamp: string;
}

const Inbox: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [user, setUser] = useState<any>(null);
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
    querySnapshot.forEach(doc => {
      const invitation = doc.data();
      invitationsList.push({
        id: doc.id,
        boardID: invitation.boardID,
        senderID: invitation.senderID,
        status: invitation.status,
        timestamp: invitation.timestamp,
      });
    });
    setInvitations(invitationsList);
  };

  //hanterar statusen och adderar users email till members fältet i Boards
  const handleAccept = async (invitationID: string, boardID: string) => {
    try {
      const invitationRef = doc(db, "Invitations", invitationID);
      await updateDoc(invitationRef, {
        status: "accepted",
      });

      const boardRef = doc(db, "Boards", boardID);
      await updateDoc(boardRef, {
        members: arrayUnion(user.email),
      });

      console.log("Invitation accepted!");
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
            <h3>Invitation to join board {invitation.boardID}</h3>
            <p>From: {invitation.senderID}</p>
            <button onClick={() => handleAccept(invitation.id, invitation.boardID)}>Accept</button>
            <button onClick={() => handleDeny(invitation.id)}>Deny</button>
          </div>
        ))
      ) : (
        <p>No invitations pending</p>
      )}
    </div>
  );
};

export default Inbox;
