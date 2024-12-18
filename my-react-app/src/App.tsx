import React from 'react';
// import logo from './logo.svg';
import './CSS/App.css';
import Homepage from './TS/homepage';  // Import Homepage component
import Nav from './TS/Nav'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Import routing components

function App(): JSX.Element {
  return (
    <>
      <Router>
        <Nav />

        <Routes>
        <Route path="/" element={<Homepage />} />
        </Routes>
      </Router>

      <div className="App">
        <header className="App-header">
          <h1>Bättre Trello</h1>
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </>

  );
}

export default App;
