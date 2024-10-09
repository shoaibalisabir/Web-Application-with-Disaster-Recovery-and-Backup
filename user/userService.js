require("dotenv").config({ path: "../.env" });
const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const path = require("path");

const port = process.env.USER_SERVICE_PORT || 3001;
const mongoUri = process.env.CONNECTION_STRING;
const client = new MongoClient(mongoUri);

async function main() {
  try {
    // var mysql = require("mysql");

    // var connection = mysql.createConnection({
    //   host: process.env.RDS_HOST,
    //   user: process.env.RDS_USER,
    //   password: process.env.RDS_PASSWORD,
    //   port: 3306,
    // });

    // connection.connect(function (err) {
    //   if (err) {
    //     console.error("Database connection failed: " + err.stack);
    //     return;
    //   }

    //   console.log("Connected to database.");
    // });

    await client.connect();
    console.log("Connected to MongoDB - User Service");
    const db = client.db("todoApp");
    const usersCollection = db.collection("users");

    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.json()); // Ensure that the request body can be parsed as JSON

    // Serve static files from the public directory
    app.use(express.static(path.join(__dirname, "../public")));

    // Serve index.html when visiting the root URL
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../public", "index.html"));
    });

    app.post('/register', async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
          return res.status(400).json({ message: 'Username and password are required' });
        }
        const userExists = await usersCollection.findOne({ username });
        if (userExists) {
          return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = { username, password };
        await usersCollection.insertOne(newUser);
        res.status(201).json(newUser);
      });


    // app.post('/register', async (req, res) => {
    //     const { username, password } = req.body; // Fix typo: 'u8sername' to 'username'
    
    //     console.log('Request Body:', req.body); // Log the full request body for debugging
    
    //     // Check if username and password are provided
    //     if (!username || !password) {
    //         console.log("Please enter both username and password"); // Log the message for debugging
    //         return res.status(400).json({ message: 'Username and password are required' });
    //     }
    
    //     try {
    //         // Check if the user already exists in the database
    //         const existingUsers = await query('SELECT * FROM users WHERE username = ?', [username]);
    //         if (existingUsers.length > 0) {
    //             return res.status(400).json({ message: 'User already exists' });
    //         }
    
    //         // Insert the new user into the database
    //         const result = await query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    //         res.status(201).json({ id: result.insertId, username });
    //     } catch (error) {
    //         console.error('Database error:', error); // Log any database errors
    //         res.status(500).json({ message: 'Database error', error });
    //     }
    // });
    
    

    // Login user
    app.post("/login", async (req, res) => {
      const { username, password } = req.body;
      const user = await usersCollection.findOne({ username, password });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      res.json({ message: "Login successful", user });
    });

    app.listen(port, () => {
      console.log(`User Service running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
