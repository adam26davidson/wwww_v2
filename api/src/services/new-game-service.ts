import prisma from "../db";

const MAX_NEW_CODE_ATTEMPTS = 5;

export async function createNewGame() {
  
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
  const game = await prisma.game.findUnique({
    where: { code: code },
  });
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
