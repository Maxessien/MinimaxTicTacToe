import {
  Board,
  Player,
  type BoardRowsCols,
  type BoardValue,
  type PlayerType,
} from "./board";


class Tree {
  rootNode: Node;
  nodes: Node[];

  constructor() {
    this.nodes = [];
    this.rootNode = new Node(null, [], "Maximizer", new Board());
  }

  buildTree(node: Node) {
    const nodes = node.createChildren();
    if (nodes)
      nodes.forEach((n) => {
        this.nodes.push(n);
        this.buildTree(n);
      });
  }

  computeOptimalPath(){
    this.rootNode.computeOptimalChild()
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
  score: 0 | 1 | -1 | null
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
    this.score = null
  }

  createChildren() {
    if (this.isLeaf) return;
    const state = this.board.getState();
    const bMap = { ...this.board.getMap() };
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
        const player = new Player(
          nextLevelPlayer.type,
          nextLevelPlayer.val,
          newBoard,
        );
        const branchBoardState = structuredClone(state);
        branchBoardState[bMap[field].row][bMap[field].col] = player;
        newBoard.setState(branchBoardState);
        newNodes.push(new Node(this, [], nextLevelPlayer.type, newBoard));
      }
    }
    this.children = newNodes;
    return newNodes;
  }

  computeOptimalChild(): Node {
    if (this.isLeaf) {
      this.score = this.board.checkStateValue()
      return this
    };
    const node = this.children
      .map((child) => child.computeOptimalChild())
      .reduce((prevChild, currChild) => {
        const prevChScore = prevChild.score;
        const currChScore = currChild.score;
        const player = this.levelPlayer;
        if (prevChScore !== null && currChScore !== null)
          return prevChScore > currChScore
            ? player === "Maximizer"
              ? prevChild
              : currChild
            : player === "Maximizer"
              ? currChild
              : prevChild;
        return currChild;
      });
    this.optimalChild = node
    this.score = node.score
    return node.parent || node;
  }
}

export { Node, Tree };
