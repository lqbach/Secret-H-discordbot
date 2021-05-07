/**
 * compares two discord user objects without using === 
 * 
 * @param {object} user1 a discordjs user object
 * @param {object} user2 a discordjs user object
 * @returns {boolean} true if user objects are the same, false otherwise
 */
export const compareUsers = (user1, user2) => {
    if(user1.id === user2.id) {
        return true;
    }
    return false;
}