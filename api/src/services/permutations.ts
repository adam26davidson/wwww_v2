import { CollectedResponses } from "./sentence-service";

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
export function randomPermutations(responses: CollectedResponses) {
  const n = responses.whos.length; // number of players
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
      reduceOptions(options);

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
        let randomChoice = Math.floor(Math.random() * numChoices[randomIndex]);
        options[randomIndex] = [options[randomIndex][randomChoice]];
      }
    }

    // add the determined permutation to the master list
    permutation = options.map((o) => o[0]);
    permutations.push(permutation);
  }
  return permutations;
}
