const express = require("express");
const router = express.Router();
const pool = require("../db");

// Import one or multiple levels
        router.post("/", async (req, res) => {
          const levels = Array.isArray(req.body) ? req.body : [req.body];
          if (levels.length === 0) {
            return res.status(400).json({ error: "No levels provided" });
          }

          try {
            const inserted = [];

            for (const lvl of levels) {
              const { building_id, name, floor_number } = lvl;

              if (!building_id || !name) {
                return res.status(400).json({ error: "building_id and name are required" });
              }

              // Check for unique name within the same building
              const nameCheck = await pool.query(
                "SELECT 1 FROM levels WHERE building_id = $1 AND name = $2",
                [building_id, name]
              );

              if (nameCheck.rowCount > 0) {
                return res.status(409).json({ error: "Level name must be unique within the same building" });
              }

              const result = await pool.query(
                "INSERT INTO levels (building_id, name, floor_number) VALUES ($1, $2, $3) RETURNING *",
                [building_id, name, typeof floor_number === "number" ? floor_number : null]
              );

              inserted.push(result.rows[0]);
            }

            res.status(201).json(inserted);
          } catch (err) {
            res.status(500).json({ error: err.message });
          }
        });

module.exports = router;
