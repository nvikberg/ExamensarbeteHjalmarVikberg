import React from 'react';
// import logo from './logo.svg';
import './CSS/App.css';
import Homepage from './TS/homepage';  // Import Homepage component
import Nav from './TS/Nav'; 
import LogInPage from './TS/LogInPage';
import FetchBoard from './TS/FetchBoards';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import routing components

function App(): JSX.Element {
  return (
    <>
      <Router>
        <Nav />

        <Routes>
        <Route path="/" element={<LogInPage/>} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/boards" element={<FetchBoard />} />
        </Routes>
      </Router>

    </>

  );
}

export default App;
