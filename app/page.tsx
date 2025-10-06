"use client"

import { PathfindingVisualizer } from "@/components/pathfinding-visualizer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Pathfinding Algorithm Visualizer</h1>
        <PathfindingVisualizer />
      </div>
    </main>
  )
}
