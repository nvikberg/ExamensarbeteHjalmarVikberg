// BoardMembers.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../CSS/Card.module.css'; 


//BoardMembers hämtar data från db med hjälp av boardId som skickas som en prop, och lagrar information om boarden och medlemmarna i komponentens state
//när datan har hämtats visar den en lista med medlemmar, där varje medlem representeras av en knapp. 
//När en användare klickar på en medlem, triggas callbacken onMemberSelect, 
//som skickar den valda medlemmen till föräldrakomponenten(CARDS)


//MASSA CSS MÅSTE FORTFARANDE FIXAS HÄR 

interface BoardData {
    boardname: string;
    members: string[];  // Assuming members are emails or user IDs
}

interface BoardMembersProps {
    boardId: string;
    onMemberSelect: (member: string) => void; // Callback to pass the selected member to parent
}

const BoardMembers: React.FC<BoardMembersProps> = ({ boardId, onMemberSelect }) => {
    const [boardData, setBoardData] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBoardData = async () => {
            try {
                const boardDocRef = doc(db, 'Boards', boardId);
                const boardDoc = await getDoc(boardDocRef);

                if (boardDoc.exists()) {
                    const boardData = boardDoc.data() as BoardData;
                    setBoardData(boardData);
                } else {
                    console.error("Board not found");
                }
            } catch (error) {
                console.error('Error fetching board data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBoardData();
    }, [boardId]);

    if (loading) {
        return <p>Loading members...</p>;
    }

    return (
        <div className={styles.memberSelectionContainer}>
          <p>Select member to assign to card:</p>
          <ul>
            {boardData && boardData.members?.length > 0 ? (
              boardData.members.map((member, index) => (
                <li key={index}>
                  <button onClick={() => onMemberSelect(member)}>{member}</button>
                </li>
              ))
            ) : (
              <p className={styles.noMembersMessage}>No members available or no members added to this board yet.</p>
            )}
          </ul>
        </div>
      );
    }

export default BoardMembers;