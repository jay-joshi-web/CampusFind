const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Connect to the CampusFind MySQL database.
const db = mysql.createConnection({
    host: "localhost",
    user: "campusfind_user",
    password: "passw#@$ord",
    database: "campusfind"
});

db.connect((error) => {
  if (error) {
    console.log("Database connection failed:", error.message);
  } else {
    console.log("Connected to CampusFind database.");
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// READ: Get all lost and found reports.
app.get("/api/items", (req, res) => {
  const sql = "SELECT * FROM items ORDER BY created_at DESC";

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({ message: "Could not load items." });
    }
    res.json(results);
  });
});

// CREATE: Add a new lost or found report.
app.post("/api/items", (req, res) => {
  const { item_name, item_type, category, location, description, contact } = req.body;

  if (!item_name || !item_type || !category || !location || !contact) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  const sql = `INSERT INTO items
    (item_name, item_type, category, location, description, contact)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [item_name, item_type, category, location, description || "", contact],
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Could not save the report." });
      }
      res.status(201).json({ message: "Report added successfully.", id: result.insertId });
    }
  );
});

// DELETE: Remove a report.
app.delete("/api/items/:id", (req, res) => {
  db.query("DELETE FROM items WHERE id = ?", [req.params.id], (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Could not delete report." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.json({ message: "Report deleted successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`CampusFind is running at http://localhost:${PORT}`);
});
