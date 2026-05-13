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

type BoardState = Record<BoardRowsCols, BoardFieldVal>;

export type PlayerType = "Minimizer" | "Maximizer";

interface MethodResponse {
  success: boolean;
  message: string;
}

interface BoardFieldVal {
  row: number;
  col: number;
  value: Player | null;
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

  addValue(position: BoardRowsCols, val: Player): MethodResponse {
    if (!this.state[position])
      return { message: "Position doesn't exists", success: false };
    if (this.state[position].value)
      return { message: "Position already has a value", success: false };
    this.state[position].value = val;
    return { message: "Finished", success: true };
  }
  private flatten() {
    const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = this.state;
    const rows = [
      [a1, b1, c1],
      [a2, b2, c2],
      [a3, b3, c3],
    ];
    const cols = [
      [a1, a2, a3],
      [b1, b2, b3],
      [c1, c2, c3],
    ];
    const diagonals = [
      [a1, b2, c3],
      [c1, b2, a3],
    ];

    return { rows, cols, diagonals };
  }

  private analyse2D(vals: BoardFieldVal[][]) {
    for (const val of vals) {
      if (val.some((r) => !r.value)) continue;
      if (val.every((v) => v.value?.val === val[0].value?.val)) return val[0];
    }
    return null;
  }

  private stillHasMoves() {
    const { a1, a2, a3, b1, b2, b3, c1, c2, c3 } = this.state;
    const all = [a1, a2, a3, b1, b2, b3, c1, c2, c3];
    return all.some(({ value }) => !value);
  }

  checkStateVal(): 0 | 1 | -1 | null {
    const { cols, diagonals, rows } = this.flatten();
    const diaVal = this.analyse2D(diagonals);
    if (diaVal?.value) return diaVal.value?.goalScore;
    const colVal = this.analyse2D(cols);
    if (colVal?.value) return colVal.value?.goalScore;
    const rowVal = this.analyse2D(rows);
    if (rowVal?.value) return rowVal.value?.goalScore;
    return this.stillHasMoves() ? 1 : 0;
  }
}

export { Board };
