export interface Cell {
  row: number
  col: number
  isWall: boolean
  isStart: boolean
  isEnd: boolean
  isVisited: boolean
  isPath: boolean
  distance: number
  previousCell?: Cell
}

export type Algorithm = "bfs" | "dfs" | "dijkstra" | "astar" | "greedy"

export type DrawMode = "wall" | "start" | "end" | null

export interface AlgorithmResult {
  visitedInOrder: Array<{ row: number; col: number; distance: number }>
  path: Array<{ row: number; col: number }>
}
