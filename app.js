const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3"); // FIXED LINE
const path = require("path");

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const InitializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

InitializeDBAndServer();

app.get("/players", async (request, response) => {
  const getPlayerQuery = `SELECT * FROM cricket_team;`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(playerArray);
});
