require('dotenv').config({ path: '../.env' });
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');


const port = process.env.USER_SERVICE_PORT || 3001;
const mongoUri = process.env.CONNECTION_STRING;
const client = new MongoClient(mongoUri);

async function main() {
    try {
        await client.connect();
        console.log('Connected to MongoDB - User Service');
        const db = client.db('todoApp');
        const usersCollection = db.collection('users');

        app.use(cors());
        app.use(bodyParser.json());

        // Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html when visiting the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

        // Register user
        app.post('/register', async (req, res) => {
            const { username, password } = req.body;
            const existingUser = await usersCollection.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const newUser = { username, password };
            await usersCollection.insertOne(newUser);
            res.status(201).json(newUser);
        });

        // Login user
        app.post('/login', async (req, res) => {
            const { username, password } = req.body;
            const user = await usersCollection.findOne({ username, password });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            res.json({ message: 'Login successful', user });
        });

        app.listen(port, () => {
            console.log(`User Service running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error(error);
    }
}

main().catch(console.error);
