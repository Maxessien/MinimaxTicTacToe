import { Board, Player, type BoardRowsCols, type BoardValue, type PlayerType } from "./board";

class Node {
  levelPlayer: PlayerType;
  parent: Node | null;
  children: Node[] | null;
  isLeaf: boolean;
  isRoot: boolean;
  board: Board;
  constructor(
    parent: Node | null,
    children: Node[] | null,
    levelPlayer: PlayerType,
    board: Board,
  ) {
    this.children = children;
    this.parent = parent;
    this.levelPlayer = levelPlayer;
    this.board = board;
    this.isLeaf = board.checkStateValue() !== null;
    this.isRoot = !parent;
  }

  createChildren() {
    if (this.isLeaf) return
    const state = this.board.getState()
    const bMap = {...this.board.getMap()}
    const nextLevelPlayer: {type: PlayerType, val: BoardValue} = this.levelPlayer === "Maximizer" ? {type: "Minimizer", val: "O"} : {type: "Maximizer", val: "X"}
    const boardFields: BoardRowsCols[] = [
      "a1", "b1", "c1",
      "a2", "b2", "c2",
      "a3", "b3", "c3"
    ];
    const newNodes: Node[] = []
    for (const field of boardFields){
      if (!state[bMap[field].row][bMap[field].col]){
        const newBoard = new Board()
        const player = new Player(nextLevelPlayer.type, nextLevelPlayer.val, newBoard)
        const branchBoardState = structuredClone(state)
        branchBoardState[bMap[field].row][bMap[field].col] = player
        newBoard.setState(branchBoardState)
        newNodes.push(new Node(this, null, nextLevelPlayer.type, newBoard))
      }
    }
    this.children = newNodes
    return newNodes
  }
}

class Tree {
  rootNode: Node
  nodes: Node[]

  constructor(){
    this.nodes = []
    this.rootNode = new Node(null, null, "Maximizer", new Board())
  }

  buildTree(node: Node){
    const nodes = node.createChildren()
    if (nodes) nodes.forEach((n)=> {
      this.nodes.push(n)
      this.buildTree(n)
    })
  }
}

export { Node, Tree };

