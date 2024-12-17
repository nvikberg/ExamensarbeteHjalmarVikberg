import logo from './logo.svg';
import 'C:/Users/lovis/VT24/ExamensarbeteHjalmarVikberg/my-react-app/src/CSS/App.css';
import Homepage from './TS/homepage.tsx';
import { Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bättre Trello</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
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
  );
}

export default App;
