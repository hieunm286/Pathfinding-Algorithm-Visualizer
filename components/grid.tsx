"use client"

import { memo } from "react"
import type { Cell, DrawMode } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Car, House } from "lucide-react"

interface GridProps {
  grid: Cell[][]
  onCellClick: (row: number, col: number) => void
  onMouseDown: (row: number, col: number) => void
  onMouseUp: () => void
  onMouseEnter: (row: number, col: number) => void
  showDistance: boolean
  drawMode: DrawMode
}

export const Grid = memo(
  function Grid({ grid, onCellClick, onMouseDown, onMouseUp, onMouseEnter, showDistance, drawMode }: GridProps) {
    return (
      <div
        className="inline-block border-2 border-border rounded-lg overflow-hidden select-none"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell) => (
              <GridCell
                key={`${cell.row}-${cell.col}`}
                cell={cell}
                onClick={() => onCellClick(cell.row, cell.col)}
                onMouseDown={() => onMouseDown(cell.row, cell.col)}
                onMouseEnter={() => onMouseEnter(cell.row, cell.col)}
                showDistance={showDistance}
                drawMode={drawMode}
              />
            ))}
          </div>
        ))}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if showDistance changes or grid reference changes
    return prevProps.showDistance === nextProps.showDistance && prevProps.grid === nextProps.grid && prevProps.drawMode === nextProps.drawMode
  },
)

interface GridCellProps {
  cell: Cell
  onClick: () => void
  onMouseDown: () => void
  onMouseEnter: () => void
  showDistance: boolean
  drawMode: DrawMode
}

const GridCell = memo(
  function GridCell({ cell, onClick, onMouseDown, onMouseEnter, showDistance }: GridCellProps) {
    const getCellColor = () => {
      if (cell.isStart) return "bg-blue-600"
      if (cell.isEnd) return "bg-red-500"
      if (cell.isWall) return "bg-black"
      if (cell.isPath) return "bg-yellow-400"
      if (cell.isVisited) return "bg-slate-600"
      return "bg-white"
    }

    const showDistanceValue =
      showDistance &&
      cell.isVisited &&
      !cell.isStart &&
      !cell.isEnd &&
      !cell.isPath &&
      cell.distance !== Number.POSITIVE_INFINITY

    return (
      <div
        className={cn(
          "w-6 h-6 border border-gray-300 cursor-pointer transition-colors duration-75 flex items-center justify-center text-[8px] font-semibold",
          getCellColor(),
        )}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
      >
        {cell.isStart && <span className="text-white text-xs"><Car /></span>}
        {cell.isEnd && <span className="text-white text-xs"><House /></span>}
        {showDistanceValue && <span className="text-white">{cell.distance}</span>}
      </div>
    )
  },
  (prevProps, nextProps) => {
    const prevCell = prevProps.cell
    const nextCell = nextProps.cell
    return (
      prevCell.isWall === nextCell.isWall &&
      prevCell.isStart === nextCell.isStart &&
      prevCell.isEnd === nextCell.isEnd &&
      prevCell.isVisited === nextCell.isVisited &&
      prevCell.isPath === nextCell.isPath &&
      prevCell.distance === nextCell.distance &&
      prevProps.showDistance === nextProps.showDistance &&
      prevProps.drawMode === nextProps.drawMode
    )
  },
)
