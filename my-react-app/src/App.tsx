import React from 'react';
import { useState } from 'react';
// import logo from './logo.svg';
import './CSS/App.css';
import Homepage from './TS/HomePage';  // Import Homepage component
import Nav from './TS/Nav'; 
import LogInPage from './TS/LogInPage';
import Board from './TS/BoardPage';
import FetchBoard from './TS/FetchBoards';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import routing components
import Logout from './TS/Logout';
import { getAuth } from 'firebase/auth';
import Inbox from './TS/Invitations';

function App(): JSX.Element {


  //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
const [user, setUser] = useState<any>('');
const auth = getAuth();


  return (
    <>
      <Router>
        <Nav />

        <Routes>
        <Route path="/" element={<LogInPage/>} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/inbox" element={<Inbox />} />

        <Route path="/boards" element={<FetchBoard />} />

        <Route path="/board/:boardId" element={<Board/>} />

        </Routes>
      </Router>

    </>

  );
}

export default App;
