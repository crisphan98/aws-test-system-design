const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "rootpass",
  database: process.env.DB_NAME || "testdb",
};

const masterPool = mysql.createPool({
  host: process.env.DB_MASTER_HOST || "db-master",
  ...dbConfig,
});

const replicaPool = mysql.createPool({
  host: process.env.DB_REPLICA_HOST || "db-replica",
  ...dbConfig,
});

app.post("/messages", async (req, res) => {
  const { message } = req.body;
  try {
    await masterPool.query(
      "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255))"
    );
    await masterPool.query("INSERT INTO messages (message) VALUES (?)", [message]);
    res.status(201).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "write failed" });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const [rows] = await replicaPool.query("SELECT * FROM messages");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "read failed" });
  }
});

app.get("/", (req, res) => {
  res.send(`Hello from App Server on port ${port}`);
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
