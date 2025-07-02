const mongodb = require("mongodb");
const co = require("co");
const url =
  "mongodb+srv://adam26davidson:groovyman77@cluster0.axrdl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

exports.wwww = (req, res) => {
  co(function* () {
    const client = yield mongodb.MongoClient.connect(url);
    let body = req.body;
    let responseData = {};
    if (body.type == "enter-waiting-room") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        let gameState = yield client
          .db("wwww")
          .collection("active-games")
          .findOne(query);
        if (gameState.gameStage == "waiting-room") {
          let game = new Game();
          game.state = gameState;
          let playerId = game.addPlayer(body.name);
          update = {
            $set: {
              players: game.state.players,
              numPlayers: game.state.numPlayers,
            },
          };
          yield client
            .db("wwww")
            .collection("active-games")
            .updateOne(query, update);
          responseData = {
            gameState: game.state,
            playerId: playerId,
            codeWasValid: true,
          };
        } else {
          responseData = { codeWasValid: false };
        }
      } else {
        responseData = { codeWasValid: false };
      }
    } else if (body.type == "create-waiting-room") {
      let newGame = new Game();
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
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
    } else if (body.type == "start-game") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        const update = { $set: { gameStage: "in-progress" } };
        yield client
          .db("wwww")
          .collection("active-games")
          .updateOne(query, update);
        responseData = {
          codeWasValid: true,
        };
      } else {
        responseData = {
          codeWasValid: false,
        };
      }
    } else if (body.type == "post-response") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        let gameState = yield client
          .db("wwww")
          .collection("active-games")
          .findOne(query);
        let game = new Game();
        game.state = gameState;
        game.markPlayerDone(body.playerId);
        let update;
        if (gameState.responses.length == gameState.numPlayers - 1) {
          update = {
            $push: { responses: body.response },
            $set: {
              gameStage: "all-players-waiting",
              players: game.state.players,
            },
          };
        } else {
          update = {
            $push: { responses: body.response },
            $set: { players: game.state.players },
          };
        }
        yield client
          .db("wwww")
          .collection("active-games")
          .updateOne(query, update);
        responseData = { codeWasValid: true };
      } else {
        responseData = { codeWasValid: false };
      }
    } else if (body.type == "create-sentences") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        let gameState = yield client
          .db("wwww")
          .collection("active-games")
          .findOne(query);
        if (
          gameState.gameStage == "all-players-waiting" ||
          gameState.gameStage == "sentences-created"
        ) {
          let game = new Game();
          game.state = gameState;
          game.generateSentences();
          const update = {
            $set: {
              sentences: game.state.sentences,
              gameStage: "sentences-created",
              permutations: game.state.permutations,
            },
          };
          yield client
            .db("wwww")
            .collection("active-games")
            .updateOne(query, update);
          responseData = { codeWasValid: true, gameState: game.state };
        }
      } else {
        responseData = { codeWasValid: false };
      }
    } else if (body.type == "get-game-state") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        let gameState = yield client
          .db("wwww")
          .collection("active-games")
          .findOne(query);
        responseData = {
          gameState: gameState,
          codeWasValid: true,
        };
      } else {
        responseData = { codeWasValid: false };
      }
    } else if (body.type == "leave-game") {
      let activeCodesArray = yield client
        .db("wwww")
        .collection("active-room-codes")
        .find()
        .toArray();
      let activeCodes = activeCodesArray[0].codes;
      if (activeCodes.includes(body.code)) {
        const query = { code: body.code };
        let gameState = yield client
          .db("wwww")
          .collection("active-games")
          .findOne(query);
        if (gameState.gameStage == "waiting-room") {
          let game = new Game();
          game.state = gameState;
          const foundPlayer = game.removePlayer(body.playerId);
          if (foundPlayer) {
            update = {
              $set: {
                players: game.state.players,
                numPlayers: game.state.numPlayers,
              },
            };
            yield client
              .db("wwww")
              .collection("active-games")
              .updateOne(query, update);
            responseData = {
              gameState: game.state,
              codeWasValid: true,
              playerIdWasValid: true,
            };
          } else {
            responseData = {
              codeWasValid: true,
              playerIdWasValid: false,
            };
          }
        } else {
          responseData = { codeWasValid: false };
        }
      } else {
        responseData = { codeWasValid: false };
      }
    } else if (body.type == "end-game") {
      const query = { name: "allCodes" };
      const update = {
        $pull: { codes: body.code },
      };
      yield client
        .db("wwww")
        .collection("active-room-codes")
        .updateOne(query, update);
      const otherQuery = { code: body.code };
      yield client.db("wwww").collection("active-games").deleteOne(otherQuery);
    } else {
      responseData = {
        message: "no case was triggered",
      };
    }

    client.close();

    res.set("Access-Control-Allow-Origin", "https://adam26davidson.github.io");
    res.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.set("Access-Control-Allow-Credentials", "true");
    res.send(responseData);
  }).catch((error) => {
    res.set("Access-Control-Allow-Origin", "https://adam26davidson.github.io");
    res.set(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.set("Access-Control-Allow-Credentials", "true");
    res.send({ Error: error.toString() });
  });
};
