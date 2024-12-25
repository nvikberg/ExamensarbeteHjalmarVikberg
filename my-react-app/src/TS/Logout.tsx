import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../Data/firebase"; // Import Firebase Auth
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

 

//OBSSS funkar inte helt än


const Logout: React.FC = () => {
    const [user, setUser] = useState<any>('');
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
              setUser(user);
              console.log(user)
            } else {
              setUser(''); 
            }
    });

    return () => unsubscribe();
}, [auth]);


const handleLogout = async () => {
    try{
        await signOut(auth);
        alert("logged out")
        // console.log(auth + "logge dout")
        navigate('/')
    } catch (error){
        console.error("error logging out", error)
    }
}

    return (  
<>
<button onClick={handleLogout}>Log out</button>
</>

    );
}
 
export default Logout;