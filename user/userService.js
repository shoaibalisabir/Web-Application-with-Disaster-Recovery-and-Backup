require("dotenv").config({ path: "../.env" });
const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const path = require("path");
var mysql = require("mysql");

const port = process.env.USER_SERVICE_PORT || 3001;
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
        "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255))";
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
      });
    });

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

    // app.post('/register', async (req, res) => {
    //     const { username, password } = req.body;
    //     if (!username || !password) {
    //       return res.status(400).json({ message: 'Username and password are required' });
    //     }
    //     const userExists = await usersCollection.findOne({ username });
    //     if (userExists) {
    //       return res.status(400).json({ message: 'User already exists' });
    //     }
    //     const newUser = { username, password };
    //     await usersCollection.insertOne(newUser);
    //     res.status(201).json(newUser);
    //   });

    app.post("/register", async (req, res) => {
      const { username, password } = req.body;

      console.log("Request Body:", req.body);

      // Validate input
      if (!username || !password) {
        console.log("Please enter both username and password");
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      try {
        // First, check if the username already exists
        const checkSql = "SELECT * FROM users WHERE username = ?";
        con.query(checkSql, [username], function (err, results) {
          if (err) {
            return res
              .status(500)
              .json({
                success: false,
                message: "Database error during username check.",
              });
          }
          // If results array has any entries, it means the username already exists
          if (results.length > 0) {
            return res
              .status(400)
              .json({ success: false, message: "Username already exists" });
          }

          // Proceed to insert the new user since the username does not exist
          const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
          const values = [username, password];

          con.query(sql, values, function (err, result) {
            if (err) {
              return res
                .status(500)
                .json({
                  success: false,
                  message: "Database error during user insertion.",
                });
            }
            // Send a success response
            return res
              .status(201)
              .json({ success: true, message: "Registration successful!" });
          });
        });
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Database error", error });
      }
    });

    // Login user
    app.post("/login", (req, res) => {
      const { username, password } = req.body;
  
      // Query to check if the user exists with the provided username and password
      const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
      const values = [username, password];
  
      con.query(sql, values, function (err, results) {
          if (err) {
              return res.status(500).json({ message: "Database error" });
          }
  
          // Check if any user is found
          if (results.length === 0) {
              return res.status(400).json({ message: "Invalid credentials" });
          }
  
          // User found, login successful
          const user = results[0]; // Get the first matching user
          res.json({ message: "Login successful", user });
      });
  });

    app.listen(port, () => {
      console.log(`User Service running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
