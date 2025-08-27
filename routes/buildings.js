const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create Building
    router.post("/", async (req, res) => {
      const { site_id, name } = req.body;
      if (!site_id || !name) return res.status(400).json({ error: "site_id and name are required" });
      try {
        // Check if building name already exists for the site
        const check = await pool.query(
          "SELECT 1 FROM buildings WHERE site_id = $1 AND name = $2",
          [site_id, name]
        );
        if (check.rows.length > 0) {
          return res.status(409).json({ error: "Building name already exists for this site" });
        }
        const result = await pool.query(
          "INSERT INTO buildings (site_id, name) VALUES ($1, $2) RETURNING *",
          [site_id, name]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

// Get Building
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM buildings WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Building not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Buildings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM buildings");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Building
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM buildings WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Building not found" });
    res.json({ message: "Building deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
