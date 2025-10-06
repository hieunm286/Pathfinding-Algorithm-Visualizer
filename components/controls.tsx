"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RotateCcw, Trash2, Play } from "lucide-react"
import type { Algorithm, DrawMode } from "@/lib/types"
import { algorithmInfo } from "@/lib/algorithms"

interface ControlsProps {
  algorithm: Algorithm
  onAlgorithmChange: (algorithm: Algorithm) => void
  drawMode: DrawMode
  onDrawModeChange: (mode: DrawMode) => void
  showDistance: boolean
  onShowDistanceChange: (show: boolean) => void
  onVisualize: () => void
  onReset: () => void
  onClear: () => void
  isVisualizing: boolean
  hasStartPoint: boolean
  hasEndPoint: boolean
  executionTime: number | null
}

export const Controls = memo(function Controls({
  algorithm,
  onAlgorithmChange,
  drawMode,
  onDrawModeChange,
  showDistance,
  onShowDistanceChange,
  onVisualize,
  onReset,
  onClear,
  isVisualizing,
  hasStartPoint,
  hasEndPoint,
  executionTime,
}: ControlsProps) {
  const info = algorithmInfo[algorithm]

  return (
    <div className="space-y-6 bg-card p-6 rounded-lg border">
      <div>
        <h2 className="text-xl font-semibold mb-4">Information</h2>

        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="show-distance">Show Node Distance</Label>
          <Switch id="show-distance" checked={showDistance} onCheckedChange={onShowDistanceChange} />
        </div>

        <div className="mb-4">
          <Label className="mb-2 block">Algorithm</Label>
          <Select value={algorithm} onValueChange={(v) => onAlgorithmChange(v as Algorithm)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bfs">Breadth-First Search</SelectItem>
              <SelectItem value="dfs">Depth-First Search</SelectItem>
              <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
              <SelectItem value="astar">A* Search</SelectItem>
              <SelectItem value="greedy">Greedy Best-First Search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted p-3 rounded text-sm mb-4">
          <p className="text-muted-foreground">{info.description}</p>
        </div>

        {executionTime !== null && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3 rounded text-sm">
            <p className="font-semibold text-green-900 dark:text-green-100">
              Execution Time: {executionTime.toFixed(2)} ms
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-3">Drawing Tools</h3>
        <div className="space-y-2">
          <Button
            variant={drawMode === "wall" ? "default" : "outline"}
            className="w-full"
            onClick={() => onDrawModeChange(drawMode === "wall" ? null : "wall")}
            disabled={isVisualizing}
          >
            {drawMode === "wall" ? "✓ " : ""}Draw Walls
          </Button>
          <Button
            variant={drawMode === "start" ? "default" : "outline"}
            className="w-full"
            onClick={() => onDrawModeChange(drawMode === "start" ? null : "start")}
            disabled={isVisualizing}
          >
            {drawMode === "start" ? "✓ " : ""}Set Start Point
          </Button>
          <Button
            variant={drawMode === "end" ? "default" : "outline"}
            className="w-full"
            onClick={() => onDrawModeChange(drawMode === "end" ? null : "end")}
            disabled={isVisualizing}
          >
            {drawMode === "end" ? "✓ " : ""}Set End Point
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onVisualize}
          disabled={isVisualizing || !hasStartPoint || !hasEndPoint}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Visualize
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onReset} disabled={isVisualizing}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClear} disabled={isVisualizing}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
        <p className='text-xs italic text-gray-400 text-right mt-2'>Author: Nando Shinji</p>
      </div>
    </div>
  )
})
