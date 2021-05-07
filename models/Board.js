import { FASCIST_BOARD, LIBERAL_BOARD } from "../utils/constants";

const Canvas = require("canvas");
const images = require("images");
// const liberal = require('../images/static/liberaltrack.png');

/**
 * DETAILS ABOUT IMAGES:
 *
 * board dims: 650 x 220
 * card dims: 70 x 95
 *
 * fascist board:
 *    - start point x:65, y:58
 *
 * liberal board:
 *    - start point x:98, y:52
 *
 */

class Board {
  constructor() {
    this.num_players = 0;
    this.fascist_wins = 0;
    this.liberal_wins = 0;
    this.fascist_board = null;
    this.liberal_board = null;
  }

  setNumPlayers(num) {
    images("./images/static/liberaltrack.png").save(
      "./images/liberal_board.png"
    );
    switch (num) {
      case 5:
      case 6:
        images("./images/static/fascisttrack56.png").save(
          "./images/fascist_board.png"
        );
        this.fascist_board = FASCIST_BOARD[6]
        break;
      case 7:
      case 8:
        images("./images/static/fascisttrack78.png").save(
          "./images/fascist_board.png"
        );
        this.fascist_board = FASCIST_BOARD[8]
        break;
      case 9:
      case 10:
        images("./images/static/fascisttrack910.png").save(
          "./images/fascist_board.png"
        );
        this.fascist_board = FASCIST_BOARD[10]
        break;
      default:
        throw "Error!";
    }
    this.liberal_board = LIBERAL_BOARD
    this._mergeBoards();
  }

  fascistWin() {
    if (this.fascist_wins >= 6) {
      throw "Error, too many wins!";
    }

    images("./images/fascist_board.png")
      .draw(
        images("./images/static/fascistp.png"),
        58 + 93 * this.fascist_wins,
        65
      )
      .save("./images/fascist_board.png");
    this._mergeBoards();

    this.fascist_wins++;
  }

  liberalWin() {
    if (this.liberal_wins >= 6) {
      throw "Error, too many wins!";
    }

    images("./images/liberal_board.png")
      .draw(
        images("./images/static/liberalp.png"),
        101 + 95 * this.liberal_wins,
        65
      )
      .save("./images/liberal_board.png");
    this._mergeBoards();

    this.liberal_wins++;
  }


  _mergeBoards() {
    images(650, 440)
      .draw(images("./images/liberal_board.png"), 0, 0)
      .draw(images("./images/fascist_board.png"), 0, 220)
      .save("./images/board.png");
  }
}

export default Board;
