import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Data/firebase";
import styles from '../CSS/AddBoard.module.css'

//ATT GÖRA - SKAPA KNAPP ATT TA BORT EMAIL FRÅN LISTAN NEDANFÖR OM MAN ÅNGRAT SIG

//Hämtar alla userEmail från Users Collections i db,
//  ploppar in emaildata i en array och mappar ut den i returnen direkt till options i select menyn
//Skickar props till addBoard (parent) vilken member som är vald för att kunnna lägga till den emailen i boarden i db (det sistnämnda händer i addboard komponenten)

interface MultipleUsersToBoardsProps {
    onSelectMembers: (members: string[]) => void;
    selectedMembers: string[]; //selectedMembers som prop för att kontrollera selectopn från addBoard
}
const MultipleUsersToBoards: React.FC<MultipleUsersToBoardsProps> = ({ onSelectMembers, selectedMembers }) => {
    // const [selectedMembers, setSelectedMembers] = useState<string[]>([]); //spara vald email
    const [userEmails, setUserEmails] = useState<string[]>([]); //array för user emails
    // const [user, setUser] = useState<any>(null); //för att spara loggad in user

    const auth = getAuth();

    useEffect(() => {
        const fetchUsersEmail = async () => {
            try {
                const usersCollection = collection(db, "Users"); // Referens till Users collection
                const querySnapshot = await getDocs(usersCollection); // Fetchar documents

                const emails: string[] = [];
                querySnapshot.forEach((doc) => {
                    const userEmail = doc.data().userEmail;
                    if (userEmail) {
                        emails.push(userEmail); //lägger email i arrayen
                    }
                });

                setUserEmails(emails); //lägger hämtade emails i statet
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsersEmail();
    }, []);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (!selectedMembers.includes(value) && value !== "") {
            const newSelection = [...selectedMembers, value];
            onSelectMembers(newSelection); // Notify parent with new selection
        }
    };


    return (
        <div>
            <p>Invite members to join your board</p>
            <select value={selectedMembers[selectedMembers.length - 1] || ""} onChange={handleSelectChange} className={styles.input}>
                <option value="">Select Members</option>
                {userEmails.length > 0 ? (
                    // Mappar över user emails och skaparen option för varje
                    userEmails.map((email, index) => (
                        <option key={index} value={email}>
                            {email}
                        </option>
                    ))
                ) : (
                    <option value="">No users found</option> //visa meddelande om ingen användare finns
                )}
            </select>
            {/* visar vilken email som valts */}
            {selectedMembers.length > 0 && (
                <div>
                    <strong>Selected Members:</strong>
                    <ul>
                        {selectedMembers.map((member, index) => (
                            <li key={index}>{member}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


export default MultipleUsersToBoards;
