import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Data/firebase";
import styles from '../CSS/AddBoard.module.css'

//Hämtar alla userEmail från Users Collections i db,
//  ploppar in emaildata i en array och mappar ut den i returnen direkt till options i select menyn
//den gör ingenting mer ännu, bara hämtat emailsen från db
interface UsersEmail {
    userEmail: string;
}

const MultipleUsersToBoards: React.FC = () => {
    const [selectedValue, setSelectedValue] = useState<string>(''); //spara vald email
    const [userEmails, setUserEmails] = useState<string[]>([]); //array för user emails
    const [user, setUser] = useState<any>(null); //för att spara loggad in user

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

    const handleChoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value);
    };

    return (
        <div>
            <p>Invite members to join your board</p>
            <select value={selectedValue} onChange={handleChoice} className={styles.input}>
                <option value="">Members</option>
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
            {selectedValue && <p>Selected Email: {selectedValue}</p>}
        </div>
    );
};

export default MultipleUsersToBoards;
