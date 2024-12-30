import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, updateDoc, query, where, getDocs, collection, setDoc } from "firebase/firestore";
import { db } from "../Data/firebase";
import { useState } from "react";
import React from 'react';

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
                    const userEmail = result.user.email

                    console.log("user info", user);
                    console.log("user email", userEmail);


                    //kollar om användaren redan finns i databasen i Users, om inte så skapas en NY user
                    if (userEmail) {
                        const usersRef = collection(firestore, 'Users');
                        const q = query(usersRef, where("userEmail", "==", userEmail));
                        const querySnapshot = await getDocs(q);

                        if (querySnapshot.empty) {
                            // If no user document is found with this email, create a new document
                            const userRef = doc(db, 'Users', user.uid);
                            await setDoc(userRef, {
                                userEmail,
                            }, { merge: true }); // merga för att inte skriva över

                            console.log('New user document created with id ', userRef.id);

                            // else loggar in utan att skapa nått
                        } else {
                            console.log('user id ' + user.uid)
                            navigate('/homepage');
                        }
                    } else {
                        console.log('error with query')
                    }
                } else {
                    console.error("Google credential is null");
                }
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });

    }

    return (
        <button onClick={handleGoogleLogin}>
            <FaGoogle></FaGoogle>
            Login with google
        </button>

    );
}

export default GoogleLogin;