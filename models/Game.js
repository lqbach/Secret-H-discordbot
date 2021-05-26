import { ROLES, POLICIES, FASCIST, LIBERAL, HITLER } from "../utils/constants";
import shuffle from "../utils/shuffle";
import { compareUsers } from "../utils/discord-helper";
import Player from "./Player";
import Board from "./Board";
import Cards from "./Cards";
import embed from "../utils/embed";

/**
 * Game class represents the entire Game state of Secret Hitler
 *
 * Methods labelled %PRIORITY% must be called during the workflow
 */
class Game {
  /**
   * Empty constructor that instantiates the entire game state.
   */
  constructor() {
    this.deck = [...POLICIES];
    shuffle(this.deck);
    this.discard = [];
    this.players = [];
    this.president = null;
    this.chancellor = null;
    this.candidate = null;
    this.draw = [];
    this.votes = {};
    this.ineligible = [];
    this.turn = 0;
    this.pass = 0;
    this.electionWon = false;

    this.currPolicy = null;

    //Should skip next president rotation if special election is called
    this.skip = false;

    this.board = new Board();

    this.liberalWins = 0;
    this.fascistWins = 0;
  }

  /**
   * %PRIORITY%
   * sets the current players in the game
   * this function should be called first to instantiate the board
   * @param {array} users - an array of discord objects
   */
  setPlayers(users) {
    if (users.length < 5 || users.length > 10) {
      console.error("Invalid number of players!");
      return;
    }

    shuffle(users);

    for (let i = 0; i < users.length; i++) {
      this.players.push(
        new Player(users[i], ROLES[users.length.toString()][i], i + 1)
      );
    }

    //shuffle once more time to determine order
    shuffle(this.players);

    this.players.forEach((player, index) => {
      player.setOrder(index + 1);
    });

    this.president = this.players[0];

    //set the board up
    this.board.setNumPlayers(this.players.length);
  }

  /**
   * finds the player in the current users array
   * @param {object} user - a discord user object
   * @return {object} returns a Player object
   */
  findPlayer(user) {
    if (this.players.length === 0) {
      console.error("No users in the list!");
      return;
    }
    let playerFound = this.players.find((player) =>
      compareUsers(player.user, user)
    );
    if (playerFound === undefined) {
      console.error(
        "No user with name " + JSON.stringify(user) + " found in the list!"
      );
      return;
    }
    return playerFound;
  }

  getAlivePlayers() {
    let alivePlayers = this.players.filter((player) => player.isAlive());
    return alivePlayers;
  }

  getFascistPlayers() {
    let fascistPlayers = this.players.filter(
      (player) => player.party === FASCIST
    );
    return fascistPlayers;
  }

  getLiberalPlayers() {
    let liberalPlayers = this.players.filter(
      (player) => player.party === LIBERAL
    );
    return liberalPlayers;
  }

  getHitlerPlayer() {
    let hitlerPlayer = this.players.find((player) => player.role === HITLER);
    return hitlerPlayer;
  }

  /**
   * %PRIORITY%
   * sets the next president in a turn
   */
  nextPresident() {
    this.ineligible = [];
    this.ineligible.push(this.chancellor);

    //check if there are 5 players or less in the game to see if
    //previous president is exempt from being a chancellor
    if (this.filterAlivePlayers().length > 5) {
      this.ineligible.push(this.president);
    }

    if (this.skip) {
      this.skip = false;
      return;
    }

    do {
      this.president = this.players[this.turn % this.players.length];
      this.turn++;
    } while (!this.president.isAlive());
  }

  /**
   * %PRIORITY%
   * players are checked to see if the chancellor can be chosen
   *
   * @param {object} user - discordjs object
   * @returns {boolean} based on whether the chancellor is eligible or not
   */
  chooseChancellor(user) {
    let player = this.findPlayer(user);
    if (
      player != undefined &&
      player.isAlive() &&
      !this.ineligible.includes(player) &&
      this.president != player
    ) {
      this.candidate = player;
      return true;
    }
    return false;
  }

  /**
   * %PRIORITY%
   * finds the player in the current users array
   * @param {object} user - a discord user object
   * @param {string} vote - either a yay or nay
   */
  vote(user, vote) {
    //determine if user can legally vote
    let player = this.findPlayer(user);
    if (player === undefined) {
      console.error("vote cannot be casted because the player does not exist");
      return;
    }

    if (!player.isAlive) {
      return;
    }

    if (vote === "yay" || vote === "nay") {
      this.votes[user.id] = vote;
    } else {
      console.log("Invalid vote! Choose yay or nay!");
    }
  }

  // withdrawVote(user) {
  //   //determine if user can legally vote
  //   let player = this.findPlayer(user);
  //   if (player === undefined) {
  //     console.error("vote cannot be casted because the player does not exist");
  //     return;
  //   }

  //   if (!player.isAlive) {
  //     return;
  //   }

  //   this.votes[user.id] = "withdraw";
  // }

  checkIfVoted(user) {
    let player = this.findPlayer(user);
    if (player === undefined) {
      console.error("vote cannot be casted because the player does not exist");
      return;
    }

    if (!player.isAlive) {
      return;
    }

    if (this.votes[user.id] === "nay" || this.votes[user.id] === "yay") {
      return true;
    }
    return false;
  }

  getVotes() {
    return this.votes;
  }

  /**
   * %PRIORITY%
   * Processes the election
   *
   * @returns {boolean} true if vote majority, false otherwise
   */
  processElection() {
    let numYay = 0;
    let numNay = 0;

    //check if everyone has voted
    if (this.filterAlivePlayers().length > Object.keys(this.votes).length) {
      console.error(
        "Not everyone has voted! Please make sure everyone has voted!"
      );
      return false;
    }

    Object.values(this.votes).forEach((vote) => {
      if (vote === "yay") {
        numYay++;
      } else if (vote === "nay") {
        numNay++;
      }
    });

    //reset number of votes
    this.votes = {};

    //might need a fix to keep track of number of passes
    if (numYay > numNay) {
      //update chancellor when election is called
      this.chancellor = this.candidate;
      this.candidate = null;
      this.electionWon = true;
      return true;
    } else {
      this.candidate = null;
      this.electionWon = false;
      return false;
    }
  }

  /**
   * %PRIORITY%
   * Draws the first 3 policies in the deck
   */
  drawPolicies() {
    if (this.deck.length < 3) {
      this.deck = [...POLICIES];
      shuffle(this.deck);
    }
    this.draw = this.deck.splice(0, 3);
    return this.draw;
  }

  /**
   * %PRIORITY%
   * Checks to see if topDeck is needed
   * Gets first policy on top of deck
   * @returns {string} policy string or null
   */
  checkTopDeckPolicy() {
    if (this.pass >= 3) {
      if (this.deck.length < 1) {
        this.deck = POLICIES;
        shuffle(this.deck);
      }
      this.draw = this.deck.splice(0, 1);
      this.pass = 0;
      return this.draw;
    } else {
      return null;
    }
  }

  /**
   * Removes the policy at the position indicated
   */
  removePolicy(pos) {
    if (pos >= this.draw.length || pos < 0) {
      console.log("Position indicated when removing policy is incorrect");
      return;
    }
    let card = this.draw.splice(pos, 1);
    return card[0];
  }

  viewPolicies() {
    Cards(this.draw);
    return this.draw;
  }

  /**
   * %PRIORITY%
   * enacts the policy
   */
  enactPolicy() {
    if (this.draw.length != 1) {
      console.log("Something went wrong!");
    } else {
      let policy = this.draw[0];
      if (policy === "liberal") {
        this.board.liberalWin();
        this.currPolicy = LIBERAL;
        this.liberalWins++;
      } else {
        this.board.fascistWin();
        this.currPolicy = FASCIST;
        this.fascistWins++;
        //executive action
      }
    }
  }

  canVeto() {
    if (this.fascistWins >= 5) {
      return true;
    }
  }

  /**
   * %PRIORITY%
   * checks to see if the game is finished
   * @returns {boolean} true if the game ends
   */
  checkEndGame() {
    if (this.liberalWins == 5 || this.fascistWins == 6) {
      return true;
    } else if (
      !this.players.find((player) => player.getRole() === HITLER).isAlive
    ) {
      return true;
    } else if (this.fascistWins > 3 && this.chancellor.getRole() === HITLER) {
      return true;
    }
    return false;
  }

  //CODING PRESIDENTIAL POWERS BELOW:

  gamePlayAction() {
    if (this.currPolicy === FASCIST) {
      return this.board.fascist_board[this.fascistWins-1];
    } else if (this.currPolicy === LIBERAL) {
      return this.board.liberal_board[this.liberalWins-1];
    }
  }

  /**
   * %PRIORITY%
   * checks the party of the user
   * @param {object} user discord user object
   * @returns {string} the user's party
   */
  actionInvestigateLoyalty(user) {
    let player = this.presidentChoosePlayer(user);
    return player.getParty();
  }

  /**
   * %PRIORITY%
   * the user passed is the next president
   * @param {object} user discord user object
   */
  actionSpecialElection(user) {
    let player = this.presidentChoosePlayer(user);
    this.skip = true;
    this.president = player;
  }

  actionSpecialElectionPlayer(player) {
    this.skip = true;
    this.president = player;
  }

  /**
   * %PRIORITY%
   * Checks to see the first three policy cards
   * @returns {array} an array of policies
   */
  actionPolicyPeek() {
    if (this.deck.length < 3) {
      this.deck = [...POLICIES];
      shuffle(this.deck);
    }
    let peek = this.deck.slice(0, 3);
    Cards(peek);
    return peek;
  }

  /**
   * %PRIORITY%
   * Shoot-no-jutsu
   * @param {object} user discord user object
   */
  actionExecute() {
    let player = this.presidentChoosePlayer(user);
    player.kill();
  }

  /**
   * %PRIORITY%
   * Can only be called when fascists have 5 polcies enacted.
   * Both president and chancellor can decide to discard the current draw.
   */
  vetoPower() {
    if (this.fascistWins < 5) {
      console.error(
        "Illegal call, veto power cannot be used in the current game state"
      );
      return;
    }

    this.draw = [];
  }

  //helper class functions
  filterAlivePlayers() {
    return this.players.filter((player) => player.isAlive());
  }

  filterCandidatePlayers() {
    return this.players.filter(
      (player) =>
        player.isAlive() &&
        this.president.user.id !== player.user.id &&
        !this.ineligible.includes(player)
    );
  }

  findPlayerWithOrder(order) {
    return this.players.find(player => player.order === order);
  }

  /**
   * retrieves a valid player if they are still alive and
   *  aren't the current president
   * @param {object} user a discord user object that isn't the current president
   * @returns {object} Person object
   */
  presidentChoosePlayer(user) {
    let player = this.findPlayer(user);
    if (compareUsers(this.president.user, user)) {
      console.error("Illegal choice of candidate, can't choose yourself!");
      return;
    }
    if (!player.isAlive()) {
      console.error("Player is dead! Try again!");
      return;
    }
    return player;
  }

  //Sanity checks, APIs that should be removed

  printPlayerList() {
    console.log(this.players);
  }
}

export default Game;
