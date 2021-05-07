const Canvas = require("canvas");
const images = require("images");
import { FASCIST, LIBERAL } from "../utils/constants"
// const liberal = require('../images/static/liberaltrack.png');

/**
 * DETAILS ABOUT IMAGES:
 *
 * card-draw-1 dims: 440 x 227
 * card-draw-2 dims: 300 x 227
 *
 * card 1 point: x: 20, y: 20
 * card 2 point: x: 160, y:20
 * card 3 point: x: 300, y: 20
 *
 */

const Cards = (draw) => {
  if (draw.length === 2) {
    images("./images/static/card-draw-2.png")
      .save("./images/draw.png");
  } else if (draw.length === 3) {
    images("./images/static/card-draw-3.png")
      .save("./images/draw.png");
  }

  else{
    return;
  }

  draw.forEach((card, index) => {
    let pngFile = "./images/static/liberalp-l.png"
    if (card === LIBERAL) {
      pngFile = "./images/static/liberalp-l.png"
    } else if (card === FASCIST) {
      pngFile = "./images/static/fascistp-l.png"
    }
    images("./images/draw.png")
      .draw(images(pngFile), 20 + 140 * index, 20)
      .save("./images/draw.png")
  })
};
export default Cards;
