module.exports = Game;

// contains data and functionality relating to the
class Game {
  constructor(state = null) {
    // this.state stores the current state of the game
    // state will be directly stored into a database document
    if (!state) {
      this.state = {
        players: [], // array of player objects
        code: "", // game code
        numPlayers: 0, // number of players
        gameStage: "waiting-room", // string code for the current stage of the game
        responses: [], // array of all the players's responses
        sentences: [], // the final shuffled sentences
        permutations: [], // the permutations that act to shuffle the responses
      };
    } else {
      this.state = state;
    }
  }

  // shuffles the responses to generate the final sentences
  generateSentences() {
    let sentences = Array(); // final sentences
    let numSentences = this.state.responses.length; // number of sentences
    let sortedResponses = this.sortResponses(); // responses separated into parts

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

  // finds a random set of three permutations subject to the conditions outlined below
  //
  // The number of players, n, must be >= 4.
  // if n < 4, use smallGroupPermutations()
  //
  // The returned permutations are arrays of integers from 0 to n-1
  // and are the result of applying the permutations to the array [0, 1 ... n-1]
  // for example the identity permutation is represented as [0, 1, ... n-1]
  //
  // The permutations returned are subject to the following condition:
  //    for a set of players J and set of permutations of the Players P,
  //    the condition on P is met iff
  //    for any p1, p2 in P, and any player j in J
  //    p1(j) != p2(j)
  //
  // This ensures that each sentence will not contain more than one response from
  // the same player
  randomPermutations() {
    const n = this.state.responses.length; // number of players
    let permutations = [];

    // find each of the three permutations
    for (let k = 0; k < 3; k++) {
      let permutation = [];
      let options = [];

      // fill each permutation position with all possible options ([0,1...n-1])
      for (let i = 0; i < n; i++) {
        let iOptions = [];
        for (let j = 0; j < n; j++) {
          iOptions.push(j);
        }
        options.push(iOptions);
      }

      // for each permutation position
      for (let i = 0; i < n; i++) {
        // remove the option which fixes the player
        // avoids breaking condition when p1 = p2
        let index = options[i].indexOf(i);
        options[i].splice(index, 1);
        // if we are on the second or third permutation
        if (k >= 1) {
          // remove options which have already been used in the first permutation
          let secondItemToRemove = permutations[k - 1].indexOf(i);
          let index2 = options[i].indexOf(secondItemToRemove);
          options[i].splice(index2, 1);
          // if we are on the third permutation
          if (k == 2) {
            // remove options which have already been used in the second permutation
            let thirdItemToRemove = permutations[0].indexOf(secondItemToRemove);
            let threeIndex = options[i].indexOf(thirdItemToRemove);
            options[i].splice(threeIndex, 1);
          }
        }
      }

      let isDetermined = false; // true when the options have been narrowed to one per index

      // while the permutation is not determined
      while (!isDetermined) {
        isDetermined = true;
        // logically reduce options as far as possible without an arbitrary choice
        this.reduceOptions(options);

        // filled with the permutation positions that have more than one option
        let indexesWithChoices = [];

        // numChoices is the number of options for each permutation position
        let numChoices = options.map((o, i) => {
          if (o.length > 1) {
            indexesWithChoices.push(i);
          }
          return o.length;
        });

        // number of perm. positions that contain more than one option
        let numIndexes = indexesWithChoices.length;

        // if there are perm. positions with more than on option
        if (numIndexes > 0) {
          isDetermined = false; // permutation is not yet determined

          // select a random perm. position that has more than one option
          let randomIndex =
            indexesWithChoices[Math.floor(Math.random() * numIndexes)];
          // pick a random option for the selected perm. position
          let randomChoice = Math.floor(
            Math.random() * numChoices[randomIndex]
          );
          options[randomIndex] = [options[randomIndex][randomChoice]];
        }
      }

      // add the determined permutation to the master list
      permutation = options.map((o) => o[0]);
      permutations.push(permutation);
    }
    return permutations;
  }

  // Reduces options based on two principles (a lot like sudoku)
  //
  // 1: If a permutation position has only one option left, then no other permutation
  //    position can contain that option (permutation must be ONTO mapping)
  // 2: If for some option i, there is only one permutation position containing that option,
  //    then all other options for the permutation position should be removed
  //
  // the returned set of options will be reduced as far as possible without an arbitrary choice
  reduceOptions(o) {
    const n = o.length;
    let passedBoth = false;
    while (!passedBoth) {
      passedBoth = true;

      // principle 1
      // for each permutation position
      for (let i = 0; i < n; i++) {
        // if there is only one option left
        if (o[i].length == 1) {
          // for each permutation position
          for (let j = 0; j < n; j++) {
            // if it is not the original position, but includes the original position's only option
            if (j != i && o[j].includes(o[i][0])) {
              // remove the option
              let index = o[j].indexOf(o[i][0]);
              o[j].splice(index, 1);
              passedBoth = false; // set test to failed
            }
          }
        }
      }

      // principle 2
      // for each option, 1
      for (let i = 0; i < n; i++) {
        // to be filled with permutation positions that contain i
        let optionsContainingI = [];

        // for each permutation position j
        for (let j = 0; j < n; j++) {
          // if the permutation position j contains option i, put j in the list
          if (o[j].includes(i)) {
            optionsContainingI.push(j);
          }
        }
        // if there is only one permutation position that contains option i,
        if (optionsContainingI.length == 1) {
          // if i is not already the only option in said permutation position
          if (o[optionsContainingI[0]].length != 1) {
            // set i as the only option
            o[optionsContainingI[0]] = [i];
            passedBoth = false; // set test to failed
          }
        }
      }
    }
  }

  // gets a set of permutations in the same format as randomPermutations()
  // but for a smaller number of players where the conditions cannot be upheld
  // the number of players must be less than 4
  smallGroupsPermutations() {
    let n = this.state.responses.length; // number of players
    if (n == 3) {
      // 3 players
      // choose randomly from the predefined sets of permutations
      const options = [
        [
          [1, 2, 0],
          [1, 2, 0],
          [1, 2, 0],
        ],
        [
          [2, 0, 1],
          [2, 0, 1],
          [2, 0, 1],
        ],
        [
          [1, 2, 0],
          [2, 0, 1],
          [2, 0, 1],
        ],
        [
          [2, 0, 1],
          [1, 2, 0],
          [1, 2, 0],
        ],
      ];
      const randomIndex = Math.floor(Math.random() * 4);
      return options[randomIndex];
    } else if (n == 2) {
      // 2 players
      return [
        [1, 0],
        [1, 0],
        [1, 0],
      ];
    } else if (n == 1) {
      // 1 player
      return [[0], [0], [0]];
    }
  }

  // takes responses and separates them out into the four parts (who, what, where, why)
  sortResponses() {
    let responses = this.state.responses;
    let sortedResponses = { whos: [], whats: [], wheres: [], whys: [] };
    for (let response of responses) {
      sortedResponses.whos.push({
        name: response.name,
        response: response.who,
      });
      sortedResponses.whats.push({
        name: response.name,
        response: response.what,
      });
      sortedResponses.wheres.push({
        name: response.name,
        response: response.where,
      });
      sortedResponses.whys.push({
        name: response.name,
        response: response.why,
      });
    }
    return sortedResponses;
  }

  // records that a player has completed the
  markPlayerDone(id) {
    for (let i = 0; i < this.state.numPlayers; i++) {
      if (this.state.players[i].id == id) {
        this.state.players[i].doneWithQuestions = true;
      }
    }
  }

  removePlayer(id) {
    let foundPlayer = false;
    for (let i = 0; i < this.state.players.length; i++) {
      if (this.state.players[i].id == id) {
        this.state.players.splice(i, 1);
        foundPlayer = true;
        this.state.numPlayers -= 1;
        foundPlayer = true;
      }
    }
    return foundPlayer;
  }

  addPlayer(name) {
    this.state.numPlayers += 1;
    const id = this.state.numPlayers;
    const player = {
      name: name,
      id: id,
      doneWithQuestions: false,
    };
    this.state.players.push(player);
    return id;
  }

  newGameCode(existingGameCodes) {
    let code = this.generateRandomCode();
    while (existingGameCodes.includes(code)) {
      code = this.generateRandomCode();
    }
    return code;
  }

  generateRandomCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numCharacters = characters.length;
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * numCharacters));
    }
    return code;
  }
}
