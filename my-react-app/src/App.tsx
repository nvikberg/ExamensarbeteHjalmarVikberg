import React from 'react';
import { useState } from 'react';
// import logo from './logo.svg';
import './CSS/App.css';
import Homepage from './TS/HomePage';  // Import Homepage component
import Nav from './TS/navComponents/Nav'; 
import LogInPage from './TS/accountComponents/LogInPage';
import Board from './TS/boardComponents/BoardPage';
import FetchBoard from './TS/boardComponents/FetchBoards';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import routing components
import Logout from './TS/accountComponents/Logout';
import { getAuth } from 'firebase/auth';
import Inbox from './TS/accountComponents/Invitations';
import ProfilePage from './TS/accountComponents/ProfilePage';

function App(): JSX.Element {


  //OBS håller på att lägga till så programmet trackar om man ät inloggad så ska inte login länken synas
const [user, setUser] = useState<any>('');
const auth = getAuth();


  return (
    <>
      <Router>
        <Nav />

        <Routes>
        <Route path="/login" element={<LogInPage/>} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profilepage" element={<ProfilePage />} />

        <Route path="/boards" element={<FetchBoard />} />

        <Route path="/board/:boardId" element={<Board />} />

        </Routes>
      </Router>

    </>

  );
}

export default App;
