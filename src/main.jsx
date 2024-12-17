import { createRoot } from 'react-dom/client'
import { App } from './components/App.jsx'
// function Welcome() {

//     const name = 'Nicko';
//     const age = 10;
//     return (
//         <div>
//             <h1>Hej, {name}!</h1>
//             <p>Du är {age * 12} år gammal.</p>
//         </div>
//     )
// }


const root = createRoot(document.querySelector('#root'))
root.render(<App />)