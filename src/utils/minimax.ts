import type { Board, PlayerType } from "./board"



class Node {
  levelPlayer: PlayerType
  parent: Node | null
  children: Node[] | null
  isLeaf: boolean
  isRoot: boolean
  board: Board
  constructor(parent: Node | null, children: Node[] | null, levelPlayer: PlayerType, board: Board){
    this.children = children
    this.parent = parent
    this.levelPlayer = levelPlayer
    this.board = board
    this.isLeaf = !children || children?.length === 0
    this.isRoot = !parent
  }
}

export {Node}