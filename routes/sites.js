const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create Site
    router.post("/", async (req, res) => {
      const { name, location } = req.body;
      if (!name || !location) return res.status(400).json({ error: "name or location is required" });
      try {
        // Check if site name already exists
        const existing = await pool.query("SELECT id FROM sites WHERE name = $1", [name]);
        if (existing.rows.length > 0) {
          return res.status(409).json({ error: "Site already exist" });
        }
        const result = await pool.query(
          "INSERT INTO sites (name, location) VALUES ($1, $2) RETURNING *",
          [name, location || null]
        );
        res.status(201).json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

// Get Site
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sites WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Site not found" });
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Sites
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sites");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Site
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM sites WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Site not found" });
    return res.status(200).json({ message: "Site deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;