import express, { Request, Response } from 'express';
import mysql, { QueryError, RowDataPacket } from 'mysql2';
import cors from 'cors';

const app = express();
const port = 5000; //kan ändra till nått annat
const err = "";

// Enable CORS for frontend communication
app.use(cors());

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'berell-piserver.duckdns.org',
  user: 'hjalberg',                  
  password: 'CbM-IUu6O5K0Yjpf',              
  database: 'hjalberg',              
  port: 3306,   
});

db.connect((err) => {
  if (err) {
    console.error('Could not connect to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Define a route to get data from the database
app.get('/users', (req: Request, res: Response) => {
  const query = 'SELECT * FROM users'; 
  db.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
