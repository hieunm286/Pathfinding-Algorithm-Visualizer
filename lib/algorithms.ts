import type { Cell, AlgorithmResult } from "./types"

export const algorithmInfo = {
  bfs: {
    name: "Breadth-First Search",
    description:
      "BFS is unweighted and guarantees the shortest path. It explores all neighbors at the current depth before moving deeper.",
  },
  dfs: {
    name: "Depth-First Search",
    description:
      "DFS is unweighted and does not guarantee the shortest path. It explores as far as possible along each branch before backtracking.",
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description:
      "Dijkstra's algorithm is weighted and guarantees the shortest path. It's optimal for graphs with non-negative edge weights.",
  },
  astar: {
    name: "A* Search",
    description:
      "A* is weighted and uses heuristics to find the shortest path efficiently. It combines the benefits of Dijkstra and Greedy Best-First.",
  },
  greedy: {
    name: "Greedy Best-First Search",
    description:
      "Greedy Best-First Search is unweighted and does not guarantee the shortest path. It uses heuristics to move toward the goal quickly.",
  },
}

function getNeighbors(grid: Cell[][], cell: Cell): Cell[] {
  const neighbors: Cell[] = []
  const { row, col } = cell
  const rows = grid.length
  const cols = grid[0].length

  // Up, Right, Down, Left
  const directions = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      neighbors.push(grid[newRow][newCol])
    }
  }

  return neighbors
}

function reconstructPath(endCell: Cell): Array<{ row: number; col: number }> {
  const path: Array<{ row: number; col: number }> = []
  let current: Cell | undefined = endCell

  while (current && current.previousCell) {
    if (!current.isStart) {
      path.unshift({ row: current.row, col: current.col })
    }
    current = current.previousCell
  }

  return path
}

function manhattanDistance(cell1: { row: number; col: number }, cell2: { row: number; col: number }): number {
  return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col)
}

export const algorithms = {
  bfs: async (
    grid: Cell[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
  ): Promise<AlgorithmResult> => {
    const visitedInOrder: Array<{ row: number; col: number; distance: number }> = []
    const queue: Cell[] = [grid[start.row][start.col]]
    const visited = new Set<string>()

    grid[start.row][start.col].distance = 0
    visited.add(`${start.row},${start.col}`)

    while (queue.length > 0) {
      const current = queue.shift()!

      if (current.row === end.row && current.col === end.col) {
        return {
          visitedInOrder,
          path: reconstructPath(current),
        }
      }

      if (!current.isStart) {
        visitedInOrder.push({
          row: current.row,
          col: current.col,
          distance: current.distance,
        })
      }

      const neighbors = getNeighbors(grid, current)
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`
        if (!visited.has(key) && !neighbor.isWall) {
          visited.add(key)
          neighbor.distance = current.distance + 1
          neighbor.previousCell = current
          queue.push(neighbor)
        }
      }
    }

    return { visitedInOrder, path: [] }
  },

  dfs: async (
    grid: Cell[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
  ): Promise<AlgorithmResult> => {
    const visitedInOrder: Array<{ row: number; col: number; distance: number }> = []
    const stack: Cell[] = [grid[start.row][start.col]]
    const visited = new Set<string>()

    grid[start.row][start.col].distance = 0
    visited.add(`${start.row},${start.col}`)

    while (stack.length > 0) {
      const current = stack.pop()!

      if (current.row === end.row && current.col === end.col) {
        return {
          visitedInOrder,
          path: reconstructPath(current),
        }
      }

      if (!current.isStart) {
        visitedInOrder.push({
          row: current.row,
          col: current.col,
          distance: current.distance,
        })
      }

      const neighbors = getNeighbors(grid, current)
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`
        if (!visited.has(key) && !neighbor.isWall) {
          visited.add(key)
          neighbor.distance = current.distance + 1
          neighbor.previousCell = current
          stack.push(neighbor)
        }
      }
    }

    return { visitedInOrder, path: [] }
  },

  dijkstra: async (
    grid: Cell[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
  ): Promise<AlgorithmResult> => {
    const visitedInOrder: Array<{ row: number; col: number; distance: number }> = []
    const unvisited: Cell[] = []

    // Initialize all cells
    for (const row of grid) {
      for (const cell of row) {
        cell.distance = Number.POSITIVE_INFINITY
        cell.previousCell = undefined
        unvisited.push(cell)
      }
    }

    grid[start.row][start.col].distance = 0

    while (unvisited.length > 0) {
      // Sort by distance and get the closest cell
      unvisited.sort((a, b) => a.distance - b.distance)
      const current = unvisited.shift()!

      if (current.isWall) continue
      if (current.distance === Number.POSITIVE_INFINITY) break

      if (current.row === end.row && current.col === end.col) {
        return {
          visitedInOrder,
          path: reconstructPath(current),
        }
      }

      if (!current.isStart) {
        visitedInOrder.push({
          row: current.row,
          col: current.col,
          distance: current.distance,
        })
      }

      const neighbors = getNeighbors(grid, current)
      for (const neighbor of neighbors) {
        if (!neighbor.isWall) {
          const newDistance = current.distance + 1
          if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance
            neighbor.previousCell = current
          }
        }
      }
    }

    return { visitedInOrder, path: [] }
  },

  astar: async (
    grid: Cell[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
  ): Promise<AlgorithmResult> => {
    const visitedInOrder: Array<{ row: number; col: number; distance: number }> = []
    const openSet: Cell[] = [grid[start.row][start.col]]
    const closedSet = new Set<string>()
    const fScore = new Map<string, number>()

    grid[start.row][start.col].distance = 0
    fScore.set(`${start.row},${start.col}`, manhattanDistance(start, end))

    while (openSet.length > 0) {
      // Get cell with lowest fScore
      openSet.sort((a, b) => {
        const aKey = `${a.row},${a.col}`
        const bKey = `${b.row},${b.col}`
        return (fScore.get(aKey) || Number.POSITIVE_INFINITY) - (fScore.get(bKey) || Number.POSITIVE_INFINITY)
      })
      const current = openSet.shift()!
      const currentKey = `${current.row},${current.col}`

      if (current.row === end.row && current.col === end.col) {
        return {
          visitedInOrder,
          path: reconstructPath(current),
        }
      }

      closedSet.add(currentKey)
      if (!current.isStart) {
        visitedInOrder.push({
          row: current.row,
          col: current.col,
          distance: current.distance,
        })
      }

      const neighbors = getNeighbors(grid, current)
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`
        if (closedSet.has(neighborKey) || neighbor.isWall) continue

        const tentativeG = current.distance + 1

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
        } else if (tentativeG >= neighbor.distance) {
          continue
        }

        neighbor.previousCell = current
        neighbor.distance = tentativeG
        fScore.set(neighborKey, tentativeG + manhattanDistance({ row: neighbor.row, col: neighbor.col }, end))
      }
    }

    return { visitedInOrder, path: [] }
  },

  greedy: async (
    grid: Cell[][],
    start: { row: number; col: number },
    end: { row: number; col: number },
  ): Promise<AlgorithmResult> => {
    const visitedInOrder: Array<{ row: number; col: number; distance: number }> = []
    const openSet: Cell[] = [grid[start.row][start.col]]
    const visited = new Set<string>()

    grid[start.row][start.col].distance = 0
    visited.add(`${start.row},${start.col}`)

    while (openSet.length > 0) {
      // Sort by heuristic (Manhattan distance to end)
      openSet.sort((a, b) => {
        const aDist = manhattanDistance({ row: a.row, col: a.col }, end)
        const bDist = manhattanDistance({ row: b.row, col: b.col }, end)
        return aDist - bDist
      })
      const current = openSet.shift()!

      if (current.row === end.row && current.col === end.col) {
        return {
          visitedInOrder,
          path: reconstructPath(current),
        }
      }

      if (!current.isStart) {
        visitedInOrder.push({
          row: current.row,
          col: current.col,
          distance: current.distance,
        })
      }

      const neighbors = getNeighbors(grid, current)
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`
        if (!visited.has(key) && !neighbor.isWall) {
          visited.add(key)
          neighbor.distance = current.distance + 1
          neighbor.previousCell = current
          openSet.push(neighbor)
        }
      }
    }

    return { visitedInOrder, path: [] }
  },
}
