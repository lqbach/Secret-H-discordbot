import Game from "./models/Game";
import { REAL_DISCORD_USERS } from "./utils/users";
import Embed from "./utils/embed";
import {
  NAY_REACT,
  NUMBER_REACT,
  YAY_REACT,
  INVESTIGATE,
  ELECT,
  PEEK,
  EXECUTE,
  WIN,
  GAME_STATE,
  HITLER,
} from "./utils/constants";

const Discord = require("discord.js");
require("dotenv").config();
const client = new Discord.Client();

const token = process.env.BOT_TOKEN;

const prefix = "#";

client.on("ready", () => {
  console.log("Bot is online!");
});

client.on("message", async (msg) => {
  const command = msg.content;

  //if not in a game yet, queue and start are options
  if (command === "#queue") {
    let players = await on_queue(msg.channel);

    if (players != null) {
      await new_game(msg.channel, players);
    }
  } else if (command === "#queueTest") {
    let players = await on_queue(msg.channel);
    if (players != null) {
      console.log(players.map((player) => player.tag));
    }
    console.log("timed out");
  } else if (command === "#startTest") {
    let users = REAL_DISCORD_USERS;
    client.token = token;
    const fetchUser = async (id) => client.users.fetch(id);
    let players = users.map((user) => fetchUser(user.id));
    await Promise.all(players).then((values) => {
      players = values;
    });
    await new_game(msg.channel, players);
  } else if (command === "#electionTest") {
    let users = REAL_DISCORD_USERS;
    client.token = token;
    const fetchUser = async (id) => client.users.fetch(id);
    players = users.map((user) => fetchUser(user.id));
    Promise.all(players).then((values) => {
      players = values;
      test_election_state(msg.channel);
    });
  } else if (command === "#asyncTest") {
    let users = REAL_DISCORD_USERS;
    client.token = token;
    const fetchUser = async (id) => client.users.fetch(id);
    players = users.map((user) => fetchUser(user.id));
    Promise.all(players).then((values) => {
      players = values;
      test_action_state(msg.channel);
    });
  } else if (command === "#queueTest") {
    let players = await on_queue(msg.channel);
    console.log(players);
    console.log("Finished!");
  }

  //for testing purposes
});

const test_election_state = async (channel) => {
  let game = new Game();
  game.setPlayers(players);

  while (true) {
    game.nextPresident();
    await election_state(channel, game);

    let electionEmbed = Embed.ElectionResults(game);

    await channel.send(electionEmbed);

    if (electionResult) {
      console.log("Election passed!");
    } else {
      console.log("Election not passed!");
    }
  }
};

//HELPER FUNCTIONS
/**
 * Creates a queue to let users join the game
 * @param {DiscordChannel} channel a discord channel
 * @returns {array} returns an array of Discord User objects
 */
const on_queue = async (channel) => {
  try {
    const embedQueue = Embed.Queue([]);
    let usersInQueue = await new Promise((resolve, _) => {
      let players = [];
      channel.send(embedQueue).then(async function (message) {
        await message.react("🎲");

        const filter = async (reaction, user) => {
          if (user.bot) {
            return false;
          }
          if (reaction.emoji.name === "🎲") {
            if (players.length < 10) {
              return true;
            } else if (players.length > 10) {
              throw Error("Something terrible happened");
            }
          } else if (reaction.emoji.name === "🇩🇪") {
            if (players.length <= 10 && players.length >= 5) {
              return true;
            }
          }
          await reaction.users.remove(user.id);
          return false;
        };

        const collector = message.createReactionCollector(filter, {
          time: 300000,
          dispose: true,
        });

        collector.on("collect", async (reaction, user) => {
          if (reaction.emoji.name === "🎲") {
            if (players.length < 10) {
              console.log(`${user.tag} collected and added`);
              players.push(user);

              embedQueue.embed.fields[0] = {
                name: "Players in queue",
                value: `${players.length}`,
              };
              await message.edit(embedQueue);
              if (players.length == 5) {
                await message.react("🇩🇪");
                embedQueue.embed.fields[1].value =
                  "Enough players are in queue, press 🇩🇪 to start the game!";
                await message.edit(embedQueue);
              } else if (players.length == 10) {
                embedQueue.embed.fields[1].value =
                  "MAX PLAYERS IN QUEUE! Press 🇩🇪 to start the game!";
                await message.edit(embedQueue);
              }
            }
            //this should never be reached by filter, but will add for sanity check
            else if (players.length > 10) {
              throw new Error("Exceeded collection on queue!");
            }
          } else if (reaction.emoji.name === "🇩🇪") {
            //another sanity check in case
            if (players.length > 10 || players.length < 5) {
              throw new Error("Not enough players in queue!");
            }

            collector.stop(["startGame"]);
          }
        });
        collector.on("remove", async (reaction, user) => {
          if (reaction.emoji.name === "🎲") {
            let index = players.indexOf(user);
            if (index > -1) {
              players.splice(index, 1);
              embedQueue.embed.fields[0] = {
                name: "Players in queue",
                value: `${players.length}`,
              };
              await message.edit(embedQueue);
            }

            if (players.length == 4) {
              message.reactions.cache
                .get("🇩🇪")
                .remove()
                .catch((error) =>
                  console.error("Emoji does not exist: " + error)
                );
              embedQueue.embed.fields[1].value = "\u200b";
              await message.edit(embedQueue);
            } else if (players.length == 9) {
              embedQueue.embed.fields[1].value =
                "Enough players are in queue, press 🇩🇪 to start the game!";
              await message.edit(embedQueue);
            }
          }
        });
        collector.on("end", async (_, reason) => {
          if (reason[0] === "startGame") {
            embedQueue.embed.fields[1].value = "Starting game...";
            await message.edit(embedQueue);
            resolve(players);
          } else if (reason[0] === "time") {
            embedQueue.embed.fields[0].name = "\u200b";
            embedQueue.embed.fields[1].name = "\u200b";
            embedQueue.embed.fields[0].value = "\u200b";
            embedQueue.embed.fields[1].value = "\u200b";
            embedQueue.embed.description = "Lobby timed out";

            await message.edit(embedQueue);
            resolve(null);
          }
        });
      });

      // new_game(channel, usersInQueue)
    });
    return usersInQueue;
  } catch (err) {
    console.log(err);
    await channel.send("ERROR WITH QUEUE");
  }
};

/**
 * Main game loop
 * @param {DiscordChannel} channel
 * @param {array} players
 * @returns
 */
const new_game = async (channel, players) => {
  try {
    let game = new Game();
    game.setPlayers(players);

    const embedStart = Embed.Start(game);

    await channel.send(embedStart);

    //send everyone their roles and parties

    for (let player of game.players) {
      await player.user.send(Embed.PlayerDescription(game, player));
    }

    //START THE GAME
    while (true) {
      //1. ASSIGN PRESIDENT
      game.nextPresident();

      await election_state(channel, game);

      console.log("Ended election state");

      let electionEmbed = Embed.ElectionResults(game);

      await channel.send(electionEmbed);

      if (game.electionWon) {
        console.log("To the policy stage!");
        if (game.fascistWins >= 3 && game.chancellor.role === HITLER) {
          let endEmbed = Embed.Endgame(game, (hitlerElect = true));
          await channel.send(endEmbed);
          return;
        }
      } else {
        console.log("Election not passed!");
        continue;
      }

      console.log("Proceeding to the policy game state!");

      await policy_state(channel, game);

      let loop = await action_state(channel, game);

      if (!loop) {
        break;
      }
    }

    console.log("FINISHED");
  } catch (err) {
    console.log(err);
    await channel.send(
      "A FATAL ERROR HAS OCCURED. PLEASE SEND SCREENSHOTS TO QUAN"
    );
  }
};

/**
 * Main game loop
 * @param {DiscordChannel} channel
 * @param {object} game Game object
 * @returns
 */
const election_state = async (channel, game) => {
  //choose a chancellor
  console.log("Candidate game state");
  let embedChoose = Embed.ChooseChancellor(game);

  let candidates = game.filterCandidatePlayers();

  let orderReactions = candidates.map((candidate) => NUMBER_REACT[candidate.order]);

  let { message, reaction } = await userReactionResponse(
    channel,
    embedChoose,
    orderReactions,
    [game.president.user.id]
  );

  let order = NUMBER_REACT.indexOf(reaction.emoji.name);

  game.chooseChancellor(game.findPlayerWithOrder(order).user)

  embedChoose.embed.description =
    `The president chose ${game.candidate.printMarkdownOrder()} as their chancellor!` +
    `\n**All players please check your DMs to vote!**`;

  await message.edit(embedChoose);

  //election
  console.log("Election game state");
  let alivePlayers = game.filterAlivePlayers();

  await Promise.all(
    alivePlayers.map(async (player) => {
      let embedVote = Embed.Vote(game);
      let dmChannel = await player.user.createDM();
      let { message, reaction } = await userReactionResponse(
        dmChannel,
        embedVote,
        [YAY_REACT, NAY_REACT],
        [player.user.id]
      );

      if (reaction.emoji.name === YAY_REACT) {
        game.vote(player.user, "yay");
      } else {
        game.vote(player.user, "nay");
      }

      embedVote.embed.fields[0].value = `Thank you for voting. You voted ${reaction.emoji}`;
      await message.edit(embedVote);

      return Promise.resolve();
    })
  );
};

const policy_state = async (channel, game) => {
  //draw cards
  game.drawPolicies();
  //President discards policy
  let embedFirstDraw = Embed.Policy(game);

  let dmChannelPres = await game.president.user.createDM();

  let { message, reaction } = await userReactionResponse(
    dmChannelPres,
    embedFirstDraw,
    [NUMBER_REACT[1], NUMBER_REACT[2], NUMBER_REACT[3]],
    [game.president.user.id]
  );

  let index = NUMBER_REACT.findIndex((el) => el === reaction.emoji.name);
  if (index === 1 || index === 2 || index === 3) {
    console.log("Index: " + index)
    let card = game.removePolicy(index - 1);

    embedFirstDraw.embed.description = `You discarded ${reaction.emoji}, a ${card} card`;
    await message.edit(embedFirstDraw);
  }

  //Chancellor discards policy
  let embedSecondDraw = Embed.Policy(game);

  let dmChannelChan = await game.chancellor.user.createDM();

  let skipByVeto = false;
  let presidentDeny = false;

  if (game.canVeto()) {
    let {
      message: chanMessage,
      reaction: chanReaction,
    } = await userReactionResponse(
      dmChannelChan,
      embedSecondDraw,
      [NUMBER_REACT[1], NUMBER_REACT[2], "❗"],
      [game.chancellor.user.id]
    );

    //veto called
    if (chanReaction.emoji.name === "❗") {
      embedSecondDraw.embed.description = `You called for a veto. Wait for the president's decision...`;
      await chanMessage.edit(embedSecondDraw);

      let embedVetoAnnounce = Embed.VetoAnnounce();
      let channelMsg = await channel.send(embedVetoAnnounce);

      let embedVeto = Embed.Veto();
      let dmChannelPres = await game.president.user.createDM();
      let {
        message: presMessage,
        reaction: presReaction,
      } = await userReactionResponse(
        dmChannelPres,
        embedVeto,
        [YAY_REACT, NAY_REACT],
        [game.president.user.id]
      );

      //wait for president's decision
      if (presReaction.emoji.name === YAY_REACT) {
        //president accepts veto
        embedVeto.embed.description = "You accepted the veto";
        await presMessage.edit(embedVeto);

        embedSecondDraw.embed.description =
          "President accepted your veto offer!";
        await chanMessage.edit(embedSecondDraw);

        embedVetoAnnounce.embed.fields[0].value = "President accepted the veto";
        await channelMsg.edit(embedVetoAnnounce);

        console.log("END THE TURN");
        return;
      } else {
        //president denies veto
        embedVeto.embed.description = "You denied the veto";
        await presMessage.edit(embedVeto);

        embedSecondDraw.embed.description = "President denied your veto offer!";
        await chanMessage.edit(embedSecondDraw);

        embedVetoAnnounce.embed.fields[0].value = "President denied the veto";
        await channelMsg.edit(embedVetoAnnounce);

        presidentDeny = true;
      }
    } else {
      //chancellor decides not to veto
      skipByVeto = true;
      index = NUMBER_REACT.findIndex((el) => el === chanReaction.emoji.name);
      if (index === 1 || index === 2) {
        let card = game.removePolicy(index - 1);

        embedSecondDraw.embed.description = `You discarded ${reaction.emoji}, a ${card} card`;
        await chanMessage.edit(embedSecondDraw);
      }
    }
  }

  if (!skipByVeto) {
    embedSecondDraw = Embed.Policy(game, presidentDeny);

    let {
      message: chanMessage,
      reaction: chanReaction,
    } = await userReactionResponse(
      dmChannelChan,
      embedSecondDraw,
      [NUMBER_REACT[1], NUMBER_REACT[2]],
      [game.chancellor.user.id]
    );

    index = NUMBER_REACT.findIndex((el) => el === chanReaction.emoji.name);
    if (index === 1 || index === 2) {
      let card = game.removePolicy(index - 1);

      embedSecondDraw.embed.description = `You discarded ${reaction.emoji}, a ${card} card`;
      await chanMessage.edit(embedSecondDraw);
    }
  }

  game.enactPolicy();

  let embedPolicy = Embed.EnactPolicy(game);
  await channel.send(embedPolicy);
};

//returns true if game is not over, else game is over
const action_state = async (channel, game) => {
  switch (game.gamePlayAction()) {
    case INVESTIGATE:
      let investigateEmbed = Embed.Investigate(game);
      ({ player, message } = await presidentSelectAction(
        game,
        investigateEmbed,
        channel
      ));

      investigateEmbed.embed.fields[1].value = `The president chose ${player.printMarkdownOrder()}`;
      message.edit(investigateEmbed);

      let partyEmbed = Embed.InvestParty(player);
      await game.president.user.send(partyEmbed);

      break;

    case ELECT:
      let electEmbed = Embed.Elect(game);

      ({ player, message } = await presidentSelectAction(
        game,
        electEmbed,
        channel
      ));

      electEmbed.embed.fields[1].value = `The president chose ${player.printMarkdownOrder()}`;
      await message.edit(electEmbed);

      game.actionSpecialElectionPlayer(player);

      break;

    case PEEK:
      let peekEmbedAnnounce = Embed.PeekAnnounce(game);
      await channel.send(peekEmbedAnnounce);

      game.actionPolicyPeek();
      let peekEmbed = Embed.Peek(game);
      await game.president.user.send(peekEmbed);

      break;
    case EXECUTE:
      let executeEmbed = Embed.Execute(game);

      ({ player, message } = presidentSelectAction(
        game,
        executeEmbed,
        channel
      ));

      executeEmbed.embed.fields[1].value = `${player.printMarkdownOrder()} has been executed by the president!`;
      message.edit(executeEmbed);

      player.kill();

      //check if the kill was hitler
      if (player.role === HITLER) {
        let embedWinKill = Embed.Endgame(game, (hitlerDead = true));
        await channel.send(embedWinKill);
        return false;
      }
      break;
    case WIN:
      game.liberalWins = 5;
      let embedWin = Embed.Endgame(game);
      await channel.send(embedWin);
      return false;
    default: //null
  }
  return true;
};

const test_action_state = async (channel) => {
  let game = new Game();
  game.setPlayers(players);
  let message, player;

  switch (ELECT) {
    case INVESTIGATE:
      let investigateEmbed = Embed.Investigate(game);
      ({ player, message } = await presidentSelectAction(
        game,
        investigateEmbed,
        channel
      ));

      investigateEmbed.embed.fields[1].value = `The president chose ${player.printMarkdownOrder()}`;
      message.edit(investigateEmbed);

      let partyEmbed = Embed.InvestParty(player);
      await game.president.user.send(partyEmbed);

      break;

    case ELECT:
      let electEmbed = Embed.Elect(game);

      ({ player, message } = await presidentSelectAction(
        game,
        electEmbed,
        channel
      ));

      electEmbed.embed.fields[1].value = `The president chose ${player.printMarkdownOrder()}`;
      await message.edit(electEmbed);

      game.actionSpecialElectionPlayer(player);

      break;

    case PEEK:
      let peekEmbedAnnounce = Embed.PeekAnnounce(game);
      await channel.send(peekEmbedAnnounce);

      game.actionPolicyPeek();
      let peekEmbed = Embed.Peek(game);
      await game.president.user.send(peekEmbed);

      break;
    case EXECUTE:
      let executeEmbed = Embed.Execute(game);

      ({ player, message } = presidentSelectAction(
        game,
        executeEmbed,
        channel
      ));

      executeEmbed.embed.fields[1].value = `${player.printMarkdownOrder()} has been executed by the president!`;
      message.edit(executeEmbed);

      player.kill();

      //check if the kill was hitler
      if (player.role === HITLER) {
        let embedWinKill = Embed.Endgame(game, (hitlerDead = true));
        await channel.send(embedWinKill);
        return false;
      }
      break;
    case WIN:
      game.liberalWins = 5;
      let embedWin = Embed.Endgame(game);
      await channel.send(embedWin);
      return false;
    default: //null
  }

  return true;
};

//president action that lets them select a person
//returns a player object
const presidentSelectAction = async (game, embed, channel) => {
  let validPlayers = game.filterAlivePlayers();
  let validReactions = [];
  validPlayers.forEach((player) => {
    if (game.president.user.id !== player.user.id) {
      validReactions.push(NUMBER_REACT[player.order]);
    }
  });
  let { message, reaction } = await userReactionResponse(
    channel,
    embed,
    validReactions,
    [game.president.user.id]
  );

  let index = NUMBER_REACT.indexOf(reaction.emoji.name) - 1;
  let player = game.players[index];
  return { player, message };
};

const userReactionResponse = (channel, message, reactionNames, userIds) => {
  return new Promise((resolve, reject) => {
    channel.send(message).then(async (msg) => {
      for (let j = 0; j < reactionNames.length; j++) {
        await msg.react(reactionNames[j]);
      }

      const filter = async (reaction, user) => {
        if (user.bot) {
          return false;
        }
        if (
          reactionNames.includes(reaction.emoji.name) &&
          userIds.includes(user.id)
        ) {
          return true;
        }
        await reaction.users.remove(user.id);
        return false;
      };

      msg
        .awaitReactions(filter, { max: 1, time: 600000, errors: ["time"] })
        .then((collected) => {
          console.log(` Reaction collected: ${collected.last().emoji}`);
          resolve({ message: msg, reaction: collected.last() });
        })
        .catch((collected) => {
          console.log("Time is up!");
          reject({ message: null, reaction: collected });
        });
    });
  });
};

//main game loop here

client.login(token);
