import {
  Board,
  Player,
  type BoardFieldVal,
  type BoardRowsCols,
  type BoardState,
  type BoardValue,
  type PlayerType,
} from "./board";

class Tree {
  rootNode: Node;

  constructor(rootNode: Node) {
    this.rootNode = rootNode;
  }

  buildTree(node: Node) {
    const nodes = node.createChildren();
    if (nodes) {
      nodes.forEach((n) => {
        this.buildTree(n);
      });
    }
  }

  computeOptimalPath(node: Node) {
    node.computeOptimalChild();
    return node;
  }
}

class Node {
  levelPlayer: PlayerType;
  parent: Node | null;
  children: Node[];
  isLeaf: boolean;
  isRoot: boolean;
  board: Board;
  optimalChild: Node | null;
  score: 0 | 1 | -1 | null;
  staticNodeState: BoardState;
  constructor(
    parent: Node | null,
    children: Node[],
    levelPlayer: PlayerType,
    board: Board,
  ) {
    this.children = children;
    this.parent = parent;
    this.levelPlayer = levelPlayer;
    this.board = board;
    this.isLeaf = board.checkStateValue() !== null;
    this.isRoot = !parent;
    this.optimalChild = null;
    this.score = null;
    this.staticNodeState = board.getState();
  }

  createChildren() {
    if (this.isLeaf) return;
    const state = this.board.getState();
    const bMap = this.board.getMap();
    const nextLevelPlayer: { type: PlayerType; val: BoardValue } =
      this.levelPlayer === "Maximizer"
        ? { type: "Minimizer", val: "O" }
        : { type: "Maximizer", val: "X" };
    const boardFields: BoardRowsCols[] = [
      "a1",
      "b1",
      "c1",
      "a2",
      "b2",
      "c2",
      "a3",
      "b3",
      "c3",
    ];
    const newNodes: Node[] = [];
    for (const field of boardFields) {
      if (!state[bMap[field].row][bMap[field].col]) {
        const newBoard = new Board();
        const branchBoardState: BoardState = [];
        for (const val of state)
          branchBoardState.push(val.map((v) => v) as PlayerType[] | null[]);
        branchBoardState[bMap[field].row][bMap[field].col] =
          nextLevelPlayer.type;
        newBoard.setState(branchBoardState);
        newNodes.push(new Node(this, [], nextLevelPlayer.type, newBoard));
      }
    }
    this.children = newNodes;
    return newNodes;
  }

  computeOptimalChild(): Node {
    if (this.isLeaf) {
      this.score = this.board.checkStateValue();
      return this;
    }
    const node = this.children
      .map((child) => child.computeOptimalChild())
      .reduce((prevChild, currChild) => {
        const prevChScore = prevChild.score;
        const currChScore = currChild.score;
        const player = this.levelPlayer;
        if (prevChScore !== null && currChScore !== null) {
          // If they are exactly equal, favor the previously found good path
          if (prevChScore === currChScore) {
            return prevChild;
          }

          // Otherwise, apply standard Max/Min seeking
          if (player === "Maximizer") {
            return prevChScore > currChScore ? prevChild : currChild;
          } else {
            // Minimizer
            return prevChScore < currChScore ? prevChild : currChild;
          }
        }
        return currChild;
      });
    this.optimalChild = node;
    this.score = node.score;
    return node.parent || node;
  }
}

class MinimaxBot extends Tree {
  player: Player;
  currentNode: Node;
  nextNode: Node | null;

  constructor(player: Player, rootNode: Node) {
    super(rootNode);
    this.player = player;
    this.currentNode = this.rootNode;
    this.nextNode = null;
    this.buildTree(this.currentNode);
  }

  private getMoveRowCol() {
    if (!this.nextNode) return { row: 1, col: 1 };
    let map: BoardFieldVal = { row: 1, col: 1 };
    const currFlat = this.currentNode.board.getState().flat();
    const nextFlat = this.nextNode.board.getState().flat();
    for (const [idx, n] of nextFlat.entries()) {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      if (currFlat[idx] === null && n !== null) {
        map = { row, col };
        break;
      }
    }
    return map;
  }

  setNodeFromState(state: BoardState) {
    const flattened = state.flat();
    const matchedChild = this.currentNode.children.find((child) => {
      const childFlattened = child.staticNodeState.flat();
      return childFlattened.every((c, idx) => c === flattened[idx]);
    });
    if (matchedChild) {
      this.currentNode = matchedChild;
    }
  }

  makeMove() {
    this.computeOptimalPath(this.currentNode);
    console.log(this.currentNode, this.currentNode.optimalChild);
    this.nextNode = this.currentNode.optimalChild;
    const position = this.getMoveRowCol();
    return position;
  }
}

export { MinimaxBot, Node, Tree };

