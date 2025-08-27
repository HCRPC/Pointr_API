const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.POSTGRES_USER || "admin",
  host: process.env.DB_HOST || "db",
  database: process.env.POSTGRES_DB || "campus",
  password: process.env.POSTGRES_PASSWORD || "admin",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

module.exports = pool;
