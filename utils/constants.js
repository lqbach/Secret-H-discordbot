export const ROLES = {
    5:  ['liberal', 'liberal', 'liberal', 'fascist', 'hitler'],
    6:  ['liberal', 'liberal', 'liberal', 'liberal', 'fascist', 'hitler'],
    7:  ['liberal', 'liberal', 'liberal', 'liberal', 'fascist', 'fascist', 'hitler'],
    8:  ['liberal', 'liberal', 'liberal', 'liberal', 'fascist', 'fascist', 'fascist', 'hitler'],
    9:  ['liberal', 'liberal', 'liberal', 'liberal', 'liberal', 'fascist', 'fascist', 'fascist', 'hitler'],
    10: ['liberal', 'liberal', 'liberal', 'liberal', 'liberal', 'liberal', 'fascist', 'fascist', 'fascist', 'hitler'],
};

export const FASCIST = 'fascist'
export const LIBERAL = 'liberal'
export const HITLER = 'hitler'

//board powers
export const INVESTIGATE = 'investigate';
export const ELECT = 'elect';
export const PEEK = 'peek';
export const EXECUTE = 'execute';
export const WIN = 'win';

export const FASCIST_BOARD = {
    5:  [null, null, PEEK, EXECUTE, EXECUTE, WIN],
    6:  [null, null, PEEK, EXECUTE, EXECUTE, WIN],
    7:  [null, INVESTIGATE, ELECT, EXECUTE, EXECUTE, WIN],
    8:  [null, INVESTIGATE, ELECT, EXECUTE, EXECUTE, WIN],
    9:  [INVESTIGATE, INVESTIGATE, ELECT, EXECUTE, EXECUTE, WIN],
    10: [INVESTIGATE, INVESTIGATE, ELECT, EXECUTE, EXECUTE, WIN],
};

export const LIBERAL_BOARD = [null, null, null, null, WIN];

export const POLICIES = [
    'liberal',
    'liberal',
    'liberal',
    'liberal',
    'liberal',
    'liberal',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist',
    'fascist'
];

export const YAY_REACT = String.fromCodePoint("Y".codePointAt(0) - 65 + 0x1f1e6);
export const NAY_REACT = String.fromCodePoint("N".codePointAt(0) - 65 + 0x1f1e6);
export const NUMBER_REACT = [
    "\u0030\u20E3",
    "\u0031\u20E3",
    "\u0032\u20E3",
    "\u0033\u20E3",
    "\u0034\u20E3",
    "\u0035\u20E3",
    "\u0036\u20E3",
    "\u0037\u20E3",
    "\u0038\u20E3",
    "\u0039\u20E3",
    "\u0040\u20E3",
  ];

export const GAME_STATE = {
    NEW_GAME: 'game-new',
    START_TURN: 'game-start-turn',
    ELECTION: "game-election",
    POLICY: "game-policy",
    ACTION: "game-action",
    END_TURN: 'game-end-turn'
}


