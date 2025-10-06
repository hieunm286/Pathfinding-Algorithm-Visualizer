"use client"

import { useState, useCallback, useRef } from "react"
import { Grid } from "./grid"
import { Controls } from "./controls"
import { algorithms } from "@/lib/algorithms"
import type { Cell, Algorithm, DrawMode } from "@/lib/types"

const GRID_ROWS = 30
const GRID_COLS = 40

export function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Cell[][]>(() => initializeGrid())
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs")
  const [drawMode, setDrawMode] = useState<DrawMode>(null)
  const [isVisualizing, setIsVisualizing] = useState(false)
  const [showDistance, setShowDistance] = useState(true)
  const [startPoint, setStartPoint] = useState<{ row: number; col: number } | null>(null)
  const [endPoint, setEndPoint] = useState<{ row: number; col: number } | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const isMouseDownRef = useRef(false)
  const lastDrawnCellRef = useRef<{ row: number; col: number } | null>(null)

  function initializeGrid(): Cell[][] {
    const newGrid: Cell[][] = []
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow: Cell[] = []
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push({
          row,
          col,
          isWall: false,
          isStart: false,
          isEnd: false,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
        })
      }
      newGrid.push(currentRow)
    }
    return newGrid
  }

  const getCellsBetween = useCallback(
    (row0: number, col0: number, row1: number, col1: number): Array<{ row: number; col: number }> => {
      const cells: Array<{ row: number; col: number }> = []
      const dx = Math.abs(col1 - col0)
      const dy = Math.abs(row1 - row0)
      const sx = col0 < col1 ? 1 : -1
      const sy = row0 < row1 ? 1 : -1
      let err = dx - dy

      let currentRow = row0
      let currentCol = col0

      while (true) {
        cells.push({ row: currentRow, col: currentCol })

        if (currentRow === row1 && currentCol === col1) break

        const e2 = 2 * err
        if (e2 > -dy) {
          err -= dy
          currentCol += sx
        }
        if (e2 < dx) {
          err += dx
          currentRow += sy
        }
      }

      return cells
    },
    [],
  )

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isVisualizing) return

      if (drawMode === "wall") {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
          if (!newGrid[row][col].isStart && !newGrid[row][col].isEnd) {
            newGrid[row][col].isWall = !newGrid[row][col].isWall
          }
          return newGrid
        })
      } else if (drawMode === "start") {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
          if (startPoint) {
            newGrid[startPoint.row][startPoint.col].isStart = false
          }
          if (!newGrid[row][col].isWall && !newGrid[row][col].isEnd) {
            newGrid[row][col].isStart = true
            setStartPoint({ row, col })
          }
          return newGrid
        })
      } else if (drawMode === "end") {
        setGrid((prevGrid) => {
          const newGrid = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
          if (endPoint) {
            newGrid[endPoint.row][endPoint.col].isEnd = false
          }
          if (!newGrid[row][col].isWall && !newGrid[row][col].isStart) {
            newGrid[row][col].isEnd = true
            setEndPoint({ row, col })
          }
          return newGrid
        })
      }
    },
    [drawMode, isVisualizing, startPoint, endPoint],
  )

  const handleMouseDown = useCallback((row: number, col: number) => {
    isMouseDownRef.current = true
    lastDrawnCellRef.current = { row, col }
  }, [])

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false
    lastDrawnCellRef.current = null
  }, [])

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isMouseDownRef.current || isVisualizing || drawMode !== "wall") return

      const cellsToFill: Array<{ row: number; col: number }> = []

      if (lastDrawnCellRef.current) {
        const interpolatedCells = getCellsBetween(lastDrawnCellRef.current.row, lastDrawnCellRef.current.col, row, col)
        cellsToFill.push(...interpolatedCells)
      } else {
        cellsToFill.push({ row, col })
      }

      lastDrawnCellRef.current = { row, col }

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
        for (const cell of cellsToFill) {
          if (!newGrid[cell.row][cell.col].isStart && !newGrid[cell.row][cell.col].isEnd) {
            newGrid[cell.row][cell.col].isWall = true
          }
        }
        return newGrid
      })
    },
    [drawMode, isVisualizing, getCellsBetween],
  )

  const handleReset = useCallback(() => {
    if (isVisualizing) return
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
        })),
      ),
    )
    setExecutionTime(null)
  }, [isVisualizing])

  const handleClear = useCallback(() => {
    if (isVisualizing) return
    setGrid(initializeGrid())
    setStartPoint(null)
    setEndPoint(null)
    setDrawMode(null)
    setExecutionTime(null)
  }, [isVisualizing])

  const visualize = useCallback(async () => {
    if (!startPoint || !endPoint || isVisualizing) return

    setIsVisualizing(true)
    const startTime = performance.now()

    // Reset visited and path cells
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
        })),
      ),
    )

    const gridCopy = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
      })),
    )

    // Run the selected algorithm
    const algorithmFn = algorithms[algorithm]
    const { visitedInOrder, path } = await algorithmFn(gridCopy, startPoint, endPoint)

    // Animate visited cells
    for (let i = 0; i < visitedInOrder.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      const { row, col, distance } = visitedInOrder[i]
      setGrid((prevGrid) => {
        const updated = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
        updated[row][col].isVisited = true
        updated[row][col].distance = distance
        return updated
      })
    }

    // Animate path
    if (path.length > 0) {
      for (let i = 0; i < path.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        const { row, col } = path[i]
        setGrid((prevGrid) => {
          const updated = prevGrid.map((r) => r.map((cell) => ({ ...cell })))
          updated[row][col].isPath = true
          return updated
        })
      }
    }

    const endTime = performance.now()
    setExecutionTime(endTime - startTime)

    setIsVisualizing(false)
  }, [grid, algorithm, startPoint, endPoint, isVisualizing])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Grid
          grid={grid}
          onCellClick={handleCellClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          showDistance={showDistance}
          drawMode={drawMode}
        />
      </div>
      <div className="lg:w-80">
        <Controls
          algorithm={algorithm}
          onAlgorithmChange={setAlgorithm}
          drawMode={drawMode}
          onDrawModeChange={setDrawMode}
          showDistance={showDistance}
          onShowDistanceChange={setShowDistance}
          onVisualize={visualize}
          onReset={handleReset}
          onClear={handleClear}
          isVisualizing={isVisualizing}
          hasStartPoint={!!startPoint}
          hasEndPoint={!!endPoint}
          executionTime={executionTime}
        />
      </div>
    </div>
  )
}
