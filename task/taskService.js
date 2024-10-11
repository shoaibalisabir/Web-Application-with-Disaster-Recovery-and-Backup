require('dotenv').config({ path: '../.env' });
const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
var mysql = require("mysql");

const port = process.env.TASK_SERVICE_PORT || 3000;
const mongoUri = process.env.CONNECTION_STRING;
const client = new MongoClient(mongoUri);

async function main() {
    try {

        var con = mysql.createConnection({
            host: process.env.RDS_HOST,
            user: process.env.RDS_USER,
            password: process.env.RDS_PASSWORD,
            // port: process.env.RDS_PORT,
            database: process.env.RDS_DB,
          });
      
          con.connect(function (err) {
            if (err) throw err;
            console.log("Connected!");
            var sql =
              "CREATE TABLE IF NOT EXISTS tasks (id INT AUTO_INCREMENT PRIMARY KEY, userId VARCHAR(255), name VARCHAR(255), completed VARCHAR(255))";
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Table created");
            });
          });



        await client.connect();
        console.log('Connected to MongoDB - Task Service');
        const db = client.db('todoApp');
        const tasksCollection = db.collection('tasks');

        app.use(cors());
        app.use(bodyParser.json());

        // Get all tasks for a user
        app.get('/tasks', (req, res) => {
            const { userId } = req.query;
            const sql = "SELECT * FROM tasks WHERE userId = ?";
            con.query(sql, [userId], (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json(results);
            });
        });
        // Add new task
        app.post('/tasks', (req, res) => {
            const { userId, name } = req.body;
            const sql = "INSERT INTO tasks (userId, name, completed) VALUES (?, ?, ?)";
            const values = [userId, name, false]; // Set completed to false by default
        
            con.query(sql, values, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const newTask = { id: result.insertId, userId, name, completed: false };
                res.status(201).json(newTask);
            });
        });

        // Update task status
        app.put('/tasks/:id', (req, res) => {
            const taskId = req.params.id;
            const { completed } = req.body;
            const sql = "UPDATE tasks SET completed = ? WHERE id = ?";
            con.query(sql, [completed, taskId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Task updated' });
            });
        });

        // Delete a task
        app.delete('/tasks/:id', (req, res) => {
            const taskId = req.params.id;
            const sql = "DELETE FROM tasks WHERE id = ?";
            con.query(sql, [taskId], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Task deleted' });
            });
        });

        app.listen(port, () => {
            console.log(`Task Service running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error(error);
    }
}

main().catch(console.error);
