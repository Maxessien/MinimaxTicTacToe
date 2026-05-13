type BoardRowsCols =
  | "a1"
  | "b1"
  | "c1"
  | "a2"
  | "b2"
  | "c2"
  | "a3"
  | "b3"
  | "c3";

type BoardValue = "X" | "O";

type BoardState = Record<
  BoardRowsCols,
  { row: number; col: number; value: BoardValue | null }
>;

export type PlayerType = "Minimizer" | "Maximizer";

interface MethodResponse {
  success: boolean;
  message: string;
}

const initialBoardState: BoardState = {
  a1: { row: 1, col: 1, value: null },
  b1: { row: 1, col: 2, value: null },
  c1: { row: 1, col: 3, value: null },
  a2: { row: 2, col: 1, value: null },
  b2: { row: 2, col: 2, value: null },
  c2: { row: 2, col: 3, value: null },
  a3: { row: 3, col: 1, value: null },
  b3: { row: 3, col: 2, value: null },
  c3: { row: 3, col: 3, value: null },
};

class Player extends EventTarget {
  hasTurn: boolean;
  readonly type: PlayerType;
  readonly val: BoardValue;
  readonly board: Board;

  constructor(type: PlayerType, val: BoardValue, board: Board) {
    super();
    this.type = type;
    this.val = val;
    this.board = board;
    this.hasTurn = false;
  }

  play(position: BoardRowsCols): MethodResponse {
    if (!this.hasTurn) return { message: "Not Your Turn", success: false };

    const val = this.board.addValue(position, this.val);
    if (val.success) this.hasTurn = false;

    const event = new CustomEvent("just_played");
    this.dispatchEvent(event);
    return { message: val.message, success: val.success };
  }
}

class Board {
  private state: BoardState;
  private player1: Player;
  private player2: Player;

  constructor(initState = initialBoardState) {
    this.state = initState;
    this.player1 = new Player("Maximizer", "X", this);
    this.player2 = new Player("Minimizer", "O", this);
    
    this.player1.addEventListener("just_played", () => {
      this.player2.hasTurn = true;
    });
    this.player2.addEventListener("just_played", () => {
      this.player1.hasTurn = true;
    });
  }

  getState(): BoardState {
    return this.state;
  }

  getPlayers(): Player[] {
    return [this.player1, this.player2];
  }

  addValue(position: BoardRowsCols, val: BoardValue): MethodResponse {
    if (!this.state[position])
      return { message: "Position doesn't exists", success: false };
    if (this.state[position].value)
      return { message: "Position already has a value", success: false };
    this.state[position].value = val;
    return { message: "Finished", success: true };
  }
  checkStateVal(): 0 | 1 | -1 {
    return 0;
  }
}

export { Board };
