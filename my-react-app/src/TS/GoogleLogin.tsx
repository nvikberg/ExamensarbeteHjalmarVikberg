import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, updateDoc, query, where, getDocs, collection, setDoc } from "firebase/firestore";
import { db } from "../Data/firebase";
import { useState } from "react";
import React from 'react';
import styles from '../CSS/Login.module.css'

//Google login öppnar ett pop up fönster onClick, sedan signas man in med en token som generas genom firebase
//ditt google konto blir sparat i authentication, och en ny Users läggs till i databasen (bara med email just nu)


const GoogleLogin: React.FC = () => {



    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    const navigate = useNavigate();
    const firestore = getFirestore();



    const handleGoogleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // setLoading(true);

        signInWithPopup(auth, provider)
            .then(async (result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);

                if (credential) {

                    const token = credential.accessToken;
                    console.log("Google Access token", token);

                    //signed-in user info
                    const user = result.user;
                    const email = result.user.email

                    console.log("user info", user);
                    console.log("user email", email);


                    //kollar om användaren redan finns i databasen i Users, om inte så skapas en NY user
                    if (email) {
                        const usersRef = collection(firestore, 'Users');
                        const q = query(usersRef, where("email", "==", email));
                        const querySnapshot = await getDocs(q);

                        //loggar in utan att skapa nått
                        if (!querySnapshot.empty) {
                            console.log('user id ' + user.uid)
                            navigate('/homepage');

                        } else {
                            // If no user document is found with this email, it creates a new document
                            const userRef = doc(db, 'Users', user.uid);
                            await setDoc(userRef, {
                                email,
                            }, { merge: true }); // merga för att inte skriva över
                            navigate('/homepage');

                            console.log('New user document created with id ', userRef.id);
                        }
                    } else {
                        console.log('error with query')
                    }
                } else {
                    console.error("Google credential is null");
                }
            }).catch((error) => {
              
            });

    }

    return (
        <button onClick={handleGoogleLogin} className={styles.googleLoginButton}>
            <FaGoogle></FaGoogle>
        </button>

    );
}

export default GoogleLogin;