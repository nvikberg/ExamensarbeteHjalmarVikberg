import React, { useState, useEffect } from 'react';
import { db } from '../Data/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Props {
    id: string;
    cardTitle: string;
    
}
 
const CardComponent : React.FC = () => {


    return ( 
        <div className="card">
            <h2>Card Title</h2>
        </div>
     );
}
 
export default CardComponent;