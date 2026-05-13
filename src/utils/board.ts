export type BoardRowsCols =
  | "a1"
  | "b1"
  | "c1"
  | "a2"
  | "b2"
  | "c2"
  | "a3"
  | "b3"
  | "c3";

export type BoardValue = "X" | "O";

export type BoardState = Player[][] | null[][];

export type BoardMap = Record<BoardRowsCols, BoardFieldVal>;

export type PlayerType = "Minimizer" | "Maximizer";

interface MethodResponse {
  success: boolean;
  message: string;
}

export interface BoardFieldVal {
  row: number;
  col: number;
}

const boardMap: BoardMap = {
  a1: { row: 0, col: 0 },
  b1: { row: 0, col: 1 },
  c1: { row: 0, col: 2 },
  a2: { row: 1, col: 0 },
  b2: { row: 1, col: 1 },
  c2: { row: 1, col: 2 },
  a3: { row: 2, col: 0 },
  b3: { row: 2, col: 1 },
  c3: { row: 2, col: 2 },
};

const initialBoardState: BoardState = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

class Player extends EventTarget {
  hasTurn: boolean;
  readonly type: PlayerType;
  readonly val: BoardValue;
  readonly board: Board;
  readonly goalScore: -1 | 1;

  constructor(type: PlayerType, val: BoardValue, board: Board) {
    super();
    this.type = type;
    this.val = val;
    this.board = board;
    this.goalScore = type === "Maximizer" ? 1 : -1;
    this.hasTurn = false;
  }

  play(position: BoardRowsCols): MethodResponse {
    if (!this.hasTurn) return { message: "Not Your Turn", success: false };

    const val = this.board.addValue(position, this);
    if (val.success) this.hasTurn = false;

    const event = new CustomEvent("just_played");
    this.dispatchEvent(event);
    return { message: val.message, success: val.success };
  }
}

class Board {
  private state: BoardState;
  private boardMap: BoardMap;

  constructor(initState = initialBoardState) {
    this.state = initState;
    this.boardMap = boardMap;
  }

  getState(): BoardState {
    return structuredClone(this.state);
  }

  setState(newState: BoardState){
    this.state = newState
  }

  getMap(): BoardMap {
    return structuredClone(this.boardMap);
  }

  addValue(position: BoardRowsCols, val: Player): MethodResponse {
    const map = this.boardMap[position];
    if (!map) return { message: "Position doesn't exists", success: false };
    if (this.state[map.row][map.col])
      return { message: "Position already has a value", success: false };
    this.state[map.row][map.col] = val;
    return { message: "Finished", success: true };
  }

  private getAllPossibleWinCom() {
    const rowWins = [this.state[0], this.state[1], this.state[2]];
    const colWins = [
      [this.state[0][0], this.state[1][0], this.state[2][0]],
      [this.state[0][1], this.state[1][1], this.state[2][1]],
      [this.state[0][2], this.state[1][2], this.state[2][2]],
    ];
    const diagonalWins = [
      [this.state[0][0], this.state[1][1], this.state[2][2]],
      [this.state[0][2], this.state[1][1], this.state[2][0]],
    ];

    return [...rowWins, ...colWins, ...diagonalWins];
  }

  private getGoalPlayer(): Player | null {
    const allWins = this.getAllPossibleWinCom();
    for (const win of allWins) {
      if (win.some((w) => !w)) continue;
      else if (win.every((w) => w?.type === win[0]?.type)) return win[0];
    }
    return null;
  }

  checkStateValue(): 0 | 1 | -1 | null {
    if (this.state.flat().every((v) => v)) return 0;
    const goalPl = this.getGoalPlayer();
    if (!goalPl) return null;
    else return goalPl.goalScore;
  }
}

class BoardWithPlayers extends Board {
  private player1: Player;
  private player2: Player;

  constructor() {
    super();
    this.player1 = new Player("Maximizer", "X", this);
    this.player2 = new Player("Minimizer", "O", this);

    this.player1.addEventListener("just_played", () => {
      this.player2.hasTurn = true;
    });
    this.player2.addEventListener("just_played", () => {
      this.player1.hasTurn = true;
    });
  }

  getPlayers(): Player[] {
    return [this.player1, this.player2];
  }
}

export { Board, BoardWithPlayers, Player };

