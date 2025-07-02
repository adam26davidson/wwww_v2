import express from "express";
import {
  addPlayer,
  createNewGame,
  getGameByCode,
  startGame,
  submitPlayerResponse,
} from "./services/game-service";

const app = express();

app.use(express.json());

app.post("/create-waiting-room", async (req, res) => {
  try {
    const game = await createNewGame();
    res.status(201).json(game);
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
});

app.post("/enter-waiting-room", async (req, res) => {
  const { code } = req.body;
  try {
    const game = await getGameByCode(code);
    if (!game || game.stage !== "WAITING_ROOM") {
      res.json({ codeWasValid: false });
      return;
    }
    const playerId = addPlayer(game, req.body.name);
    res.json({ codeWasValid: true, gameState: game, playerId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error });
  }
});

app.post("/start-game", async (req, res) => {
  const { code } = req.body;
  try {
    const game = await getGameByCode(code);
    if (!game || game.stage !== "WAITING_ROOM") {
      res.json({ codeWasValid: false });
      return;
    }
    await startGame(game);
    res.json({ codeWasValid: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error });
  }
});

app.post("/post-response", async (req, res) => {
  const { code, playerId, response } = req.body;
  try {
    const game = await getGameByCode(code);
    if (!game || game.stage !== "WAITING_ROOM") {
      res.json({ codeWasValid: false });
      return;
    }
    await submitPlayerResponse(game, playerId, response);
    res.json({ codeWasValid: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error });
  }
});

app.post("/create-sentences", async (req, res) => {
  const { code } = req.body;
  try {
    const game = await getGameByCode(code);
    if (!game || game.stage !== "WAITING_ROOM") {
      res.json({ codeWasValid: false });
      return;
    }
    await startGame(game);
    res.json({ codeWasValid: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
