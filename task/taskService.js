require('dotenv').config({ path: '../.env' });
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const port = process.env.TASK_SERVICE_PORT || 3000;
const mongoUri = process.env.CONNECTION_STRING;
const client = new MongoClient(mongoUri);

async function main() {
    try {
        await client.connect();
        console.log('Connected to MongoDB - Task Service');
        const db = client.db('todoApp');
        const tasksCollection = db.collection('tasks');

        app.use(cors());
        app.use(bodyParser.json());

        // Get all tasks for a user
        app.get('/tasks', async (req, res) => {
            const { userId } = req.query;
            const tasks = await tasksCollection.find({ userId }).toArray();
            res.json(tasks);
        });

        // Add new task
        app.post('/tasks', async (req, res) => {
            const { userId, name } = req.body;
            const newTask = { userId, name, completed: false };
            await tasksCollection.insertOne(newTask);
            res.status(201).json(newTask);
        });

        // Update task status
        app.put('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;
            const { completed } = req.body;
            await tasksCollection.updateOne({ _id: new MongoClient.ObjectId(taskId) }, { $set: { completed } });
            res.json({ message: 'Task updated' });
        });

        // Delete a task
        app.delete('/tasks/:id', async (req, res) => {
            const taskId = req.params.id;
            await tasksCollection.deleteOne({ _id: new MongoClient.ObjectId(taskId) });
            res.json({ message: 'Task deleted' });
        });

        app.listen(port, () => {
            console.log(`Task Service running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error(error);
    }
}

main().catch(console.error);
