import { Game } from "../generated/prisma";

export type CollectedResponses = {
  whos: PrismaJson.SentencePart[];
  whats: PrismaJson.SentencePart[];
  wheres: PrismaJson.SentencePart[];
  whys: PrismaJson.SentencePart[];
};

export async function createSentences(game: Game) {
  if (
    !(
      game.stage === "ALL_PLAYERS_WAITING" || game.stage !== "SENTENCES_CREATED"
    )
  ) {
    throw new Error("game is in the incorrect stage for sentence generation");
  }
  let sentences: PrismaJson.Sentence[] = []; // final sentences
  let numSentences = game.players.length; // number of sentences
  let sortedResponses = collectSentenceParts(game); // responses separated into parts

  // get permutations to shuffle sentences
  let p = []; // permutations
  if (numSentences >= 4) {
    p = this.randomPermutations();
  } else {
    p = this.smallGroupsPermutations();
  }

  this.state.permutations = p; // store the permutations

  // apply the permutations to shuffle the responses and create final sentences
  for (let i = 0; i < numSentences; i++) {
    let sentence = {};
    sentence.who = sortedResponses.whos[i];
    sentence.what = sortedResponses.whats[p[0][i]];
    sentence.where = sortedResponses.wheres[p[1][p[0][i]]];
    sentence.why = sortedResponses.whys[p[2][p[1][p[0][i]]]];
    sentences.push(sentence);
  }
  this.state.sentences = sentences; // store sentences
}

function collectSentenceParts(game: Game) {
  let sortedResponses: CollectedResponses = {
    whos: [],
    whats: [],
    wheres: [],
    whys: [],
  };
  game.players.forEach((player) => {
    sortedResponses.whos.push({
      name: player.name,
      response: player.response?.who || "",
    });
    sortedResponses.whats.push({
      name: player.name,
      response: player.response?.what || "",
    });
    sortedResponses.wheres.push({
      name: player.name,
      response: player.response?.where || "",
    });
    sortedResponses.whys.push({
      name: player.name,
      response: player.response?.why || "",
    });
  });
  return sortedResponses;
}
