/**
 * Should be in charge of all the embeded stuff
 */
import {
  YAY_REACT,
  NAY_REACT,
  NUMBER_REACT,
  LIBERAL,
  HITLER,
  FASCIST,
} from "./constants";
const Discord = require("discord.js");

const FASCIST_PROF = new Discord.MessageAttachment(
  "./images/roles/fascist.png"
);
const LIBERAL_PROF = new Discord.MessageAttachment(
  "./images/roles/liberal.png"
);
const HITLER_PROF = new Discord.MessageAttachment("./images/roles/hitler.png");
const DRAW = new Discord.MessageAttachment("./images/draw.png");

const LIBERAL_POL = new Discord.MessageAttachment(
  "./images/static/liberalp.png"
);
const FASCIST_POL = new Discord.MessageAttachment(
  "./images/static/fascistp.png"
);

const COLOR = 0xff7b57;

const embed = {
  Queue: (players) => {
    return {
      embed: {
        color: COLOR,
        title: "Starting Lobby for Secret Hitler",
        description:
          "Click on the 🎲 reaction to join the lobby!\n" +
          "Queue is open for 5 minutes",
        fields: [
          { name: "Players in queue", value: `${players.length}` },
          { name: "\u200b", value: "\u200b" },
        ],
        timestamp: new Date(),
      },
    };
  },

  Start: (game) => {
    let playerOrderString = game.players.reduce((acc, curr, index) => {
      return acc + curr.printMarkdownOrder() + "\n";
    }, "");

    return {
      embed: {
        color: COLOR,
        title: "Objective: Win",
        description:
          "Check your DMs, roles and parties have been sent!\n" +
          "Work together with your team to win the game. ",
        fields: [{ name: "Order", value: playerOrderString }],
        timestamp: new Date(),
      },
    };
  },

  //prints fascist description, needs a game object
  FascistDescription: (game, player) => {
    let teammates = game
      .getFascistPlayers()
      .filter(
        (teammate) =>
          teammate.user.id !== player.user.id && teammate.user.role !== HITLER
      );
    let hitler = game.getHitlerPlayer();

    let teamFieldString = teammates.reduce((acc, curr, index) => {
      return acc + curr.printMarkdownOrder() + `\n`;
    }, "");

    let hitlerString = hitler.printMarkdownOrder();

    return {
      files: [FASCIST_PROF],
      embed: {
        color: COLOR,
        title: "You are Fascist",
        description: "Protect Hitler! Defeat the Liberals!",
        fields: [
          { name: "Your fellow fascist members are: ", value: teamFieldString },
          { name: "Hitler is: ", value: hitlerString },
        ],
        image: { url: "attachment://fascist.png" },
        timestamp: new Date(),
      },
    };
  },

  LiberalDescription: () => {
    return {
      files: [LIBERAL_PROF],
      embed: {
        color: COLOR,
        title: "You are Liberal",
        description: "Defeat the fascists, and don't let Hitler win!",
        image: { url: "attachment://liberal.png" },
        timestamp: new Date(),
      },
    };
  },

  HitlerDescription: (game, player) => {
    //hitler knows fellow fascist members

    let teamField = { name: "\u200b", value: "\u200b" };

    if (game.players.length === 5 || game.players.length === 6) {
      let teammates = game
        .getFascistPlayers()
        .filter(
          (teammate) =>
            teammate.user.id !== player.user.id && teammate.user.role !== HITLER
        );
      let teamFieldString = teammates.reduce((acc, curr, index) => {
        return acc + curr.printMarkdownOrder() + `\n`;
      }, "");

      teamField.name = "Your fascist members are: ";
      teamField.value = teamFieldString;
    } else if (game.players.length > 6 && game.players.length < 11) {
      teamField.name = "Good luck!";
    } else {
      teamField.name = "BIG ERROR WARNING WARNING WARNING!";
      console.error("Big error!");
    }

    return {
      files: [HITLER_PROF],
      embed: {
        color: COLOR,
        title: "You are Hitler",
        description: "Work together with fellow fascist members to win!",
        image: { url: "attachment://hitler.png" },
        fields: [teamField],
        timestamp: new Date(),
      },
    };
  },

  PlayerDescription: (game, player) => {
    if (player.role === HITLER) {
      return embed.HitlerDescription(game, player);
    } else if (player.party === FASCIST) {
      return embed.FascistDescription(game, player);
    } else if (player.party === LIBERAL) {
      return embed.LiberalDescription();
    }
  },

  ChooseChancellor: (game) => {
    let choicesString = game.players.reduce((acc, curr) => {
      if (game.president === curr) {
        return acc;
      }
      let format = "";
      if (!curr.isAlive()) {
        format = "~~";
      } else if (game.ineligible.includes(curr)) {
        format = "*";
      }
      return acc + format + curr.printMarkdownOrder() + format + `\n`;
    }, "");

    return {
      embed: {
        color: COLOR,
        title: "Choose Your Chancellor",
        description:
          `Hello President ${game.president.printMarkdown()}, please choose your chancellor from the list below!` +
          `\nDead candidates have their names ~~crossed~~ \nIneligible candidates have their names *italisized*`,
        fields: [
          {
            name: "Current order number: ",
            value: `${NUMBER_REACT[game.president.order]}`,
          },
          {
            name: "React with number to choose the user below",
            value: choicesString,
          },
        ],
        timestamp: new Date(),
      },
    };
  },

  Vote: (game) => {
    return {
      embed: {
        color: COLOR,
        title: "Voting Ballot",
        description: `Voting for the chancellor: ${game.candidate.printMarkdownOrder()}`,
        fields: [{ name: "\u200b", value: "\u200b" }],
        timestamp: new Date(),
      },
    };
  },

  ElectionResults: (game) => {
    let nayers = "\u200b";
    let yayers = "\u200b";
    let desc = "";
    let currField = [{ name: "\u200b", value: "\u200b" }];

    console.log(game.votes);

    game.filterAlivePlayers().forEach((player) => {
      let userId = player.user.id;
      let vote = game.votes[userId];
      if (vote === "yay") {
        yayers += `\n${player.printMarkdownOrder()}`;
      } else if (vote === "nay") {
        nayers += `\n${player.printMarkdownOrder()}`;
      }
    });

    let electionWin = game.processElection();

    if (electionWin) {
      desc =
        `Election Won\n` +
        `President and Chancellor, please check your DMs for the policy phase!`;
    } else {
      desc = `Votes have not been passed`;
    }

    console.log(currField);

    return {
      embed: {
        color: COLOR,
        title: "Election Results",
        description: desc,
        fields: [
          { name: "Voted 'Yay': ", value: yayers, inline: true },
          { name: "Voted 'Nay': ", value: nayers, inline: true },
        ],
      },
    };
  },

  Policy: (game, deny = false) => {
    game.viewPolicies();
    let vetoString = game.canVeto() && !deny ? "Veto [❗] can be played" : "";
    return {
      files: [DRAW],
      embed: {
        color: COLOR,
        title: "Discard a Policy",
        description: `Use the reactions below to discard a policy card \n${vetoString}`,
        image: { url: "attachment://draw.png" },
        timestamp: new Date(),
      },
    };
  },

  VetoAnnounce: () => {
    return {
      embed: {
        color: COLOR,
        title: "Veto Called",
        description: "The chancellor has called a veto.",
        fields: [{ name: "\u200b", value: "Awaiting president's decision..." }],
        timestamp: new Date(),
      },
    };
  },

  Veto: () => {
    return {
      embed: {
        color: COLOR,
        title: "Veto Offer Extended",
        description:
          "Your chancellor is offering to veto the policies. Do you offer consent?",
        timestamp: new Date(),
      },
    };
  },

  EnactPolicy: (game) => {
    let desc = "Fascist Policy has been enacted";
    let thumbnailFile = FASCIST_POL;
    let thumbnailUrl = "attachment://fascistp.png";

    if (game.draw[0] === LIBERAL) {
      desc = "Liberal Policy has been enacted";
      thumbnailFile = LIBERAL_POL;
      thumbnailUrl = "attachment://liberalp.png";
    }

    const BOARD = new Discord.MessageAttachment("./images/board.png");

    return {
      files: [BOARD, thumbnailFile],
      embed: {
        color: COLOR,
        title: "Policy Enacted",
        thumbnail: { url: thumbnailUrl },
        description: desc,
        fields: [
          {
            name: "President: ",
            value: `${game.president.printMarkdownOrder()}`,
            inline: true,
          },
          {
            name: "Chancellor: ",
            value: `${game.chancellor.printMarkdownOrder()}`,
            inline: true,
          },
        ],
        image: { url: "attachment://board.png" },
        timestamp: new Date(),
      },
    };
  },

  Investigate: (game) => {
    let choicesString = game.filterAlivePlayers().reduce((acc, curr) => {
      if (game.president === curr) {
        return acc;
      }
      return acc + curr.printMarkdownOrder() + `\n`;
    }, "");

    return {
      embed: {
        color: COLOR,
        title: "Investigate Loyalty",
        description:
          `President ${game.president.printMarkdownOrder()}` +
          ` must choose a player to investigate. This will reveal the player's role!`,
        fields: [
          {
            name: "React with number to choose the user below",
            value: choicesString,
          },
          { name: "\u200b", value: "\u200b" },
        ],
        timestamp: new Date(),
      },
    };
  },

  InvestParty: (player) => {
    let thumbnailFile = FASCIST_PROF;
    let thumbnailUrl = "attachment://fascist.png";

    if (player.party === LIBERAL) {
      thumbnailFile = LIBERAL_PROF;
      thumbnailUrl = "attachment://liberal.png";
    }

    return {
      files: [thumbnailFile],
      embed: {
        color: COLOR,
        title: "Investigate Loyalty: Results",
        thumbnail: { url: thumbnailUrl },
        description: `You decided to investigate ${player.printMarkdownOrder()}`,
        fields: [
          {
            name: "Party: ",
            value: `${player.party}`,
          },
        ],
        timestamp: new Date(),
      },
    };
  },

  Elect: (game) => {
    let choicesString = game.filterAlivePlayers().reduce((acc, curr) => {
      if (game.president === curr) {
        return acc;
      }
      return acc + curr.printMarkdownOrder() + `\n`;
    }, "");

    return {
      embed: {
        color: COLOR,
        title: "Special Election",
        description:
          `President ${game.president.printMarkdownOrder()}` +
          ` must choose a player to make president next round.`,
        fields: [
          {
            name: "React with number below to choose the player ",
            value: choicesString,
          },
          { name: "\u200b", value: "\u200b" },
        ],
        timestamp: new Date(),
      },
    };
  },

  Execute: (game) => {
    let choicesString = game.filterAlivePlayers().reduce((acc, curr) => {
      if (game.president === curr) {
        return acc;
      }
      return acc + curr.printMarkdownOrder() + `\n`;
    }, "");

    return {
      embed: {
        color: COLOR,
        title: "Execute",
        description:
          `President ${game.president.printMarkdownOrder()}` +
          ` must choose a player to execute.`,
        fields: [
          {
            name: "React with number below to kill the player ",
            value: choicesString,
          },
          { name: "\u200b", value: "\u200b" },
        ],
        timestamp: new Date(),
      },
    };
  },

  PeekAnnounce: (game) => {
    return {
      embed: {
        color: COLOR,
        title: "Policy Peek",
        description:
          `Hello President ${game.president.printMarkdownOrder()},` +
          ` check your DM to see the next 3 policy cards`,
        timestamp: new Date(),
      },
    };
  },

  Peek: (game) => {
    return {
      files: [DRAW],
      embed: {
        color: COLOR,
        title: "Policy Peek",
        description: `The next three cards in the deck are shown below:`,
        image: { url: "attachment://draw.png" },
        timestamp: new Date(),
      },
    };
  },

  Endgame: (game, hitlerDead = false, hitlerElect = false) => {
    let currTitle = "FATAL ERROR!";
    let desc =
      "SOMETHING TERRIBLE HAS HAPPENED REPORT WITH SCREENSHOTS PLEASE!";
    if (game.fascistWins === 6) {
      currTitle = "FASCISTS WIN!";
      desc = "Fascists have successfully passed 6 policies!";
    } else if (game.liberalWins === 5) {
      currTitle = "LIBERALS WIN!";
      desc = "Liberals have successfully passed 5 policies!";
    } else if (hitlerDead) {
      currTitle = "LIBERALS WIN!";
      desc = "Hitler has been killed!";
    } else if (hitlerElect) {
      currTitle = "FASCISTS WIN!";
      desc = "Hitler has been elected chancellor";
    }

    let liberalTeam = "";
    let fascistTeam = "";
    let hitler = "";

    game.players.forEach((player) => {
      if (player.role === HITLER) {
        hitler = player.printMarkdownOrder();
      } else if (player.party === FASCIST) {
        fascistTeam = fascistTeam + player.printMarkdownOrder() + "\n";
      } else if (player.party === LIBERAL) {
        liberalTeam = liberalTeam + player.printMarkdownOrder() + "\n";
      }
    });

    return {
      embed: {
        color: COLOR,
        title: currTitle,
        description: desc,
        fields: [
          { name: "Liberals: ", value: liberalTeam, inline: true },
          { name: "Fascists: ", value: fascistTeam, inline: true },
          { name: "Hitler: ", value: hitler },
        ],
        timestamp: new Date(),
      },
    };
  },
};

export default embed;
