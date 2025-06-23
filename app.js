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

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const players = await db.all(getPlayersQuery);

  const formattedPlayers = players.map((player) => ({
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }));

  response.send(formattedPlayers);
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (?, ?, ?);
  `;

  const dbResponse = await db.run(addPlayerQuery, [
    playerName,
    jerseyNumber,
    role,
  ]);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ?;
  `;
  const player = await db.get(getPlayerQuery, [playerId]);

  const formattedPlayer = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };

  response.send(formattedPlayer);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;

  const updateQuery = `
    UPDATE cricket_team
    SET 
      player_name = ?, 
      jersey_number = ?, 
      role = ?
    WHERE 
      player_id = ?;
  `;

  await db.run(updateQuery, [playerName, jerseyNumber, role, playerId]);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ?;
  `;

  await db.run(deleteQuery, [playerId]);
  response.send("Player Removed");
});

module.exports = app;
