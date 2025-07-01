import express from "express";
import { Game, PrismaClient } from "./generated/prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post("/create-waiting-room", async (req, res) => {
  let newGame: Game = {

  }
  const code = newGame.newGameCode(activeCodes);
  const query = { name: "allCodes" };
  const update = { $push: { codes: code } };
  yield client
    .db("wwww")
    .collection("active-room-codes")
    .updateOne(query, update);
  newGame.state.code = code;
  let playerId = newGame.addPlayer(body.name);
  yield client.db("wwww").collection("active-games").insert(newGame.state);
  responseData = {
    gameState: newGame.state,
    playerId: playerId,
  };
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "User creation failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
