import Game from "./models/Game";
import { REAL_DISCORD_USERS } from "./utils/users";

const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client();

const token = process.env.BOT_TOKEN;

let e_collector;
let players = [];


let in_game = false;
let game;

//SET GAME STATES
let phase = 0;

client.on("ready", () => {
  console.log("Bot is online!");
});

client.on("message", (msg) => {
  if (!in_game) {
    if (msg.content === "#queue") {
      msg.channel
        .send(
          "Starting new queue. React to join. Type #start to start the game."
        )
        .then(async function (message) {
          await message.react("🎲");

          const emoji_filter = (reaction, user) => {
            return reaction.emoji.name === "🎲";
          };
          const emoji_collector = message.createReactionCollector(
            emoji_filter,
            { dispose: true }
          );

          emoji_collector.on("collect", (reaction, user) => {
            // console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

            let index = players.indexOf(user);
            if (index == -1) {
              players.push(user);
              console.log("User pushed into queue: ");
              console.log(user);
            }
          });

          emoji_collector.on("remove", (reaction, user) => {
            console.log(`Emoji ${reaction.emoji.name} removed by ${user.tag}`);

            let index = players.indexOf(user);
            if (index > -1) {
              players.splice(index, 1);
            }
            // console.log(players);
          });

          e_collector = emoji_collector;
        });
    } else if (msg.content === "#start") {
      //filter players to make sure no bots are in the list
      players = players.filter((player) => player.bot == false);

      //check if there are enough players
      if (players.length < 5) {
        msg.channel.send(
          "There are not enough players! You need 5 to start the game."
        );
      } else if (players.length > 10) {
        msg.channel.send("There are too many players. Max is 10 for a game.");
      } else {
        if (e_collector !== undefined) {
          e_collector.stop();
        }
        in_game = true;
        msg.channel.send(
          `Get ready to play! The people playing are: ${players.join(", ")} `
        );

        game = new Game();
        game.setPlayers(players);
      }
    }
  }

  //in game
  else {
    //PHASE 1: ELECTION
    do {
      msg.channel.send("We will now be starting the game!");
      msg.channel.send(
        `The order of players is as follows: ${game.players.map(
          (player, index) => {
            `${index}. ${player}\n`;
          }
        )}`
      );
    } while (game.checkEndGame());
  }
});

client.login(token);
