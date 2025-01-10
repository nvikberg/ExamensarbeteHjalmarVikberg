import React, { useState, useEffect } from 'react';
import { db } from '../../Data/firebase';
import { onSnapshot, getDoc, collection, query, where, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import styles from '../../CSS/Card.module.css';
import BoardMembers from '../boardComponents/BoardMembers';
import DeleteCards from './DeleteCard';


//hämtar och hanterar kort (tasks) för ett specifikt board och listtitel. 
//Den hämtar kortdata från db och visar dessa i en lista. 
//för varje kort kan användaren ange uppskattad tid och faktisk tid, 
//samt tilldela en medlem från en lista av medlemmar som hämtas via BoardMembers-komponenten.

interface CardData {
  id: string;
  cardtext: string;
  boardID: string;
  listtitle: string;
  estimatedHours?: number | null;
  estimatedMinutes?: number | null;
  actualHours?: number | null;
  actualMinutes?: number | null;
  assignedMember?: string[];

}

interface CardsComponentProps {
  boardId: string;
  listTitle: string;
  cards: CardData[];
}

const CardsComponent: React.FC<CardsComponentProps> = ({ cards: initialCards, boardId, listTitle }) => {
  const [infoIsVisable, setInfoIsVisable] = useState(false);
  const [editButtonShown, setEditButtonShown] = useState(true);
  const [cards, setCards] = useState<CardData[]>(initialCards); // Initializing state with the passed prop
  const [clickedCardId, setClickedCardId] = useState<string | null>(null);  //Check clicked card ID
  const [loading, setLoading] = useState(true);
  const [estHour, setEstHour] = useState<number | null>(null);
  const [estMin, setEstMin] = useState<number | null>(null);
  const [actHour, setActHour] = useState<number | null>(null);
  const [actMin, setActMin] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);  // Track selected member
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [cardIsDraggedOver, setCardIsDraggedOver] = useState<boolean>(false);


  useEffect(() => {
    const fetchCards = async () => {
      try {
        const cardsRef = collection(db, 'Cards');

        const q = query(
          cardsRef,
          where('boardID', '==', boardId), // Using destructured `boardId`
          where('listtitle', '==', listTitle) // Using destructured `listTitle`
        );

        const querySnapshot = await getDocs(q);

        const fetchedCards: CardData[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          cardtext: doc.data().cardtext,
          boardID: doc.data().boardID,
          listtitle: doc.data().listtitle,
          assignedMember: Array.isArray(doc.data().assignedMember) ? doc.data().assignedMember : [], //ser till att assignedMember alltid är en array
          estimatedHours: doc.data().estimatedHours ?? null,
          estimatedMinutes: doc.data().estimatedMinutes ?? null,
          actualHours: doc.data().actualHours ?? null,
          actualMinutes: doc.data().actualMinutes ?? null,
          ...doc.data(),
        }));

        setCards(fetchedCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
    // Set up the real-time listener
    const unsubscribe = onSnapshot(
      query(collection(db, 'Cards'), where('boardID', '==', boardId), where('listtitle', '==', listTitle)),
      (snapshot) => {
        const updatedCards: CardData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          cardtext: doc.data().cardtext,
          boardID: doc.data().boardID,
          listtitle: doc.data().listtitle,
          assignedMember: Array.isArray(doc.data().assignedMember) ? doc.data().assignedMember : [],
          estimatedHours: doc.data().estimatedHours ?? null,
          estimatedMinutes: doc.data().estimatedMinutes ?? null,
          actualHours: doc.data().actualHours ?? null,
          actualMinutes: doc.data().actualMinutes ?? null,
        }));
        setCards(updatedCards); // Update the cards state with the latest data
      },
      (error) => {
        console.error("Error fetching real-time updates:", error);
      }
    );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [boardId, listTitle]); // Dependency array includes `boardId` and `listTitle`


  const handleSaveTimeEstimation = async (cardId: string) => {
    if (estHour === null && estMin === null) {
      setAlertMessage(`Please provide either hours or minutes`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
      return;
    }

    try {
      const cardDocRef = doc(db, 'Cards', cardId);
      await updateDoc(cardDocRef, {
        estimatedHours: estHour,
        estimatedMinutes: estMin,
      });

      setAlertMessage(`Time estimation saved`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
      setEstHour(null);
      setEstMin(null);
    } catch (error) {
      console.error('Error adding time estimate:', error);
      setAlertMessage(`Failed to save time estimation. Please try again`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  const handleSaveActualTime = async (cardId: string) => {
    if (actHour === null && actMin === null) {
      setAlertMessage(`Please provide either hours or minutes`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000); return;
    }

    try {
      const cardDocRef = doc(db, 'Cards', cardId);

      await updateDoc(cardDocRef, {
        actualHours: actHour,
        actualMinutes: actMin,
      });

      setAlertMessage(`Actual time saved`);
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
      setActHour(null);
      setActMin(null);
    } catch (error) {
      console.error('Error adding actual time:', error);
      setAlertMessage('Failed to save actual time. Please try again.');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  if (loading) {
    return <p>Loading cards...</p>;
  }

  const handleDragCardStart = (event: React.DragEvent<HTMLDivElement>, cardId: string) => {
    event.stopPropagation(); // Prevent interference with list dragging
    event.dataTransfer.setData("cardId", cardId);
    event.dataTransfer.effectAllowed = "move";
    setCardIsDraggedOver(true);
  };

  const handleAssignMember = async (cardId: string) => {
    if (selectedMember) {
      try {
        const cardDocRef = doc(db, 'Cards', cardId);
        await updateDoc(cardDocRef, {
          assignedMember: arrayUnion(selectedMember),
        });
        setAlertMessage(selectedMember + ' was assigned to card!');
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
        setSelectedMember(null);
      } catch (error) {
        console.error('Error assigning member:', error);
        setAlertMessage('Member was not assigned to card!');
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
      }
    }
  };

  const handleRemoveMember = async (cardId: string, memberToRemove: string) => {
    try {
      const cardDocRef = doc(db, 'Cards', cardId);
      await updateDoc(cardDocRef, {
        assignedMember: arrayRemove(memberToRemove), // Removes the member from the array
      });
      setAlertMessage(memberToRemove + ' was removed from card!');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error removing member:', error);
      setAlertMessage('Failed assigned remove card!');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };


  const showEditCard = (cardId: string) => {
    if (clickedCardId === cardId) {
      setClickedCardId(null);
      setInfoIsVisable(true);
      setEditButtonShown(false);
    } else {
      setClickedCardId(cardId);
      setInfoIsVisable(false);
      setEditButtonShown(true);
    }
  }

  const closeEditCard = () => {
    setClickedCardId(null); // Reset the clicked card ID when closing
    setInfoIsVisable(false);
    setEditButtonShown(true);
  }


  return (
    <>
      {alertMessage && (
        <div className={styles.alertMessage}>{alertMessage}</div>
      )}

      {cards.length > 0 && (
        <div className={styles.cardContainer}>
          <ul className={styles.cardList}>
            {cards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                className={styles.card}
                draggable="true"
                onDragStart={(event) => handleDragCardStart(event, card.id)}
              >
                <div className={styles.closedCardInfo}>
                  <p><strong>{card.cardtext}</strong></p>
                  <p className={styles.closedCardInfoTime}>Est:</p>
                  {card.estimatedHours != null && <p>{card.estimatedHours} h</p>}
                  {card.estimatedMinutes != null && <p>{card.estimatedMinutes} min</p>}
                  <p className={styles.closedCardInfoTime}>Act:</p>
                  {card.actualHours != null && <p>{card.actualHours} h</p>}
                  {card.actualMinutes != null && <p> {card.actualMinutes} min</p>}
                </div>
                <div>
                  <ul className={styles.assignedMembers}>
                    {card.assignedMember?.map((member, index) => (
                      <li key={index}>
                        {member}
                      </li>
                    ))}
                  </ul>
                </div>
                {clickedCardId !== card.id && (
                  <div>
                    <button className={styles.editCardBtn} onClick={() => showEditCard(card.id)}>Edit Card</button>
                  </div>
                )}
                {clickedCardId === card.id && (
                  <div>
                    <button className={styles.closeCardBtn} onClick={closeEditCard}>X</button>
                    {/* Render the BoardMembers component only when the card has members */}
                    <BoardMembers boardId={boardId} onMemberSelect={setSelectedMember} />
                    <button
                      className={styles.assignBtn}
                      onClick={() => handleAssignMember(card.id)}
                    >
                      Assign Member
                    </button>

                    {/* Assigned members list */}
                    {Array.isArray(card.assignedMember) && card.assignedMember.length > 0 && (
                      <div className={styles.assignedMembers}>
                        <p>Assigned members:</p>
                        <ul>
                          {card.assignedMember.map((member, index) => (
                            <li key={index}>
                              {member}
                              <button
                                className={styles.removeBtn}
                                onClick={() => handleRemoveMember(card.id, member)}
                              >
                                -
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Time estimation and actual time input */}
                    <div className={styles.timeEstimation}>
                      <p>Estimated time for task:</p>
                      <input
                        type="number"
                        className={styles.estInput}
                        placeholder="Hours"
                        value={estHour ?? ''}
                        onChange={(e) => setEstHour(Number(e.target.value))}
                      />
                      <input
                        type="number"
                        className={styles.estInput}
                        placeholder="Minutes"
                        value={estMin ?? ''}
                        onChange={(e) => setEstMin(Number(e.target.value))}
                      />
                      <button
                        className={styles.saveBtn}
                        onClick={() => handleSaveTimeEstimation(card.id)}
                      >
                        Save time estimation
                      </button>

                      <p>Actual time:</p>
                      <input
                        type="number"
                        className={styles.actInput}
                        placeholder="Hours"
                        value={actHour ?? ''}
                        onChange={(e) => setActHour(Number(e.target.value))}
                      />
                      <input
                        type="number"
                        className={styles.actInput}
                        placeholder="Minutes"
                        value={actMin ?? ''}
                        onChange={(e) => setActMin(Number(e.target.value))}
                      />
                      <button className={styles.saveBtn} onClick={() => handleSaveActualTime(card.id)}>Save actual time</button>
                    </div>
                    <DeleteCards id={card.id || ""} />
                  </div>
                )}
              </div>
              
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default CardsComponent;