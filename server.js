const express = require("express");
const bodyParser = require("body-parser");

const siteRoutes = require("./routes/sites");
const buildingRoutes = require("./routes/buildings");
const levelRoutes = require("./routes/levels");

const app = express();
app.use(bodyParser.json());

app.get("/", (_req, res) => res.json({ ok: true, service: "campus-api" }));

app.use("/sites", siteRoutes);
app.use("/buildings", buildingRoutes);
app.use("/levels", levelRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
