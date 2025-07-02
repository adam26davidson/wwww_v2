import prisma from "../db";
import { Game } from "../generated/prisma";

const MAX_NEW_CODE_ATTEMPTS = 5;

export async function createNewGame(): Promise<Game> {
  const code = await getNewCode();
  return await prisma.game.create({
    data: { code, stage: "WAITING_ROOM" },
  });
}

export async function getGameByCode(code: string): Promise<Game> {
  return await prisma.game.findUnique({
    where: { code: code },
  });
}

export async function addPlayer(game: Game, playerName: string) {
  const playerId = game.players.length;
  game.players.push({
    id: playerId,
    name: playerName,
    isDone: false,
    response: null,
  });
  await prisma.game.update({
    where: { id: game.id },
    data: { players: game.players },
  });
  return playerId;
}

export async function startGame(game: Game) {
  if (game.stage !== "WAITING_ROOM") {
    throw new Error("cannot start a game that is not in WAITING_ROOM stage");
  }
  game.stage = "IN_PROGRESS";
  await prisma.game.update({
    where: { id: game.id },
    data: { stage: game.stage },
  });
}

export async function submitPlayerResponse(
  game: Game,
  playerId: number,
  response: PrismaJson.Response
) {
  const players = game.players;
  const player = players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("could not find player");
  }
  player.isDone = true;
  player.response = response;
  const data = { players: game.players, stage: game.stage };
  if (players.every((p) => p.isDone)) {
    data.stage = "ALL_PLAYERS_WAITING";
  }
  await prisma.game.update({ where: { id: game.id }, data });
}

export async function createSentences(game: Game) {
  if (
    !(
      game.stage === "ALL_PLAYERS_WAITING" || game.stage !== "SENTENCES_CREATED"
    )
  ) {
    throw new Error("game is in the incorrect stage for sentence generation");
  }
}

async function getNewCode() {
  let code: string;
  let attempts = 0;
  do {
    if (attempts > MAX_NEW_CODE_ATTEMPTS) {
      throw new Error("max attempts exceeded for creating a new code!!");
    }
    code = generateRandomCode();
    attempts++;
  } while (!(await codeAlreadyExists(code)));
  return code;
}

async function codeAlreadyExists(code: string) {
  const game = getGameByCode(code);
  return !game ? false : true;
}

function generateRandomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numCharacters = characters.length;
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * numCharacters));
  }
  return code;
}
