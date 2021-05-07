/**
 * Player class for Secret Hitler
 */
import { FASCIST, LIBERAL, HITLER, NUMBER_REACT } from "../utils/constants";

class Player {
  /**
   * Create a Player object
   * @param {object} user - A discord object of some type
   * @param {string} role - String representing the role dealt to the person
   */
  constructor(user, role) {
    this.user = user;
    if (role === HITLER) {
      this.party = FASCIST;
      this.role = HITLER;
    } else {
      this.party = role;
      this.role = null;
    }
    this.alive = true;
    this.order = null;
  }

  setOrder(num) {
    this.order = num;
  }

  /**
   * Kills the current player
   */
  kill() {
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  getUser() {
    return this.user;
  }
  getRole() {
    return this.role;
  }
  getParty() {
    return this.party;
  }
  printMarkdown() {
      return `**${this.user.username}**` +
      `#${this.user.discriminator}`
  }
  printMarkdownOrder() {
    return `${NUMBER_REACT[this.order]} **${this.user.username}**` +
    `#${this.user.discriminator}`
  }
}

export default Player;
