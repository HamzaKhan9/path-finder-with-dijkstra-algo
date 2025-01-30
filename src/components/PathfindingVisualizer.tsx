import React, { useState, useEffect } from "react";
import {
  Navigation,
  Info,
  Play,
  RotateCcw,
  HelpCircle,
  Zap,
  Clock,
  GitFork,
} from "lucide-react";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

interface Node {
  row: number;
  col: number;
  distance: number;
  isVisited: boolean;
  previousNode: Node | null;
  isWall: boolean;
}

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Node[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pathLength, setPathLength] = useState<number | null>(null);
  const [visitedNodes, setVisitedNodes] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  console.log("executionTime: ", executionTime);
  const [speed, setSpeed] = useState<"fast" | "normal" | "slow">("normal");

  useEffect(() => {
    const initialGrid = getInitialGrid();
    setGrid(initialGrid);
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
    setIsMousePressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isMousePressed) return;
    const newGrid = getNewGridWithWallToggled(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const getAnimationSpeed = () => {
    switch (speed) {
      case "fast":
        return 5;
      case "slow":
        return 20;
      default:
        return 10;
    }
  };

  const animateDijkstra = (
    visitedNodesInOrder: Node[],
    nodesInShortestPathOrder: Node[]
  ) => {
    const animationSpeed = getAnimationSpeed();
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(nodesInShortestPathOrder);
          setVisitedNodes(visitedNodesInOrder.length);
          setPathLength(nodesInShortestPathOrder.length);
        }, animationSpeed * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) {
          element.className = "node node-visited";
        }
      }, animationSpeed * i);
    }
  };

  const animateShortestPath = (nodesInShortestPathOrder: Node[]) => {
    const animationSpeed = getAnimationSpeed() * 5;
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        const element = document.getElementById(`node-${node.row}-${node.col}`);
        if (element) {
          element.className = "node node-shortest-path";
        }
        if (i === nodesInShortestPathOrder.length - 1) {
          setIsRunning(false);
        }
      }, animationSpeed * i);
    }
  };

  const visualizeDijkstra = () => {
    if (isRunning) return;
    setIsRunning(true);
    setPathLength(null);
    setVisitedNodes(null);
    setExecutionTime(null);

    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    const startTime = performance.now();
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const endTime = performance.now();
    setExecutionTime(endTime - startTime);

    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  };

  const resetGrid = () => {
    if (isRunning) return;
    const newGrid = getInitialGrid();
    setGrid(newGrid);
    setPathLength(null);
    setVisitedNodes(null);
    setExecutionTime(null);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        const element = document.getElementById(`node-${row}-${col}`);
        if (element) {
          if (row === START_NODE_ROW && col === START_NODE_COL) {
            element.className = "node node-start";
          } else if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
            element.className = "node node-finish";
          } else {
            element.className = "node";
          }
        }
      }
    }
  };

  const generateRandomWalls = () => {
    if (isRunning) return;
    const newGrid = getInitialGrid();
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 50; col++) {
        if (
          (row === START_NODE_ROW && col === START_NODE_COL) ||
          (row === FINISH_NODE_ROW && col === FINISH_NODE_COL)
        ) {
          continue;
        }
        if (Math.random() < 0.3) {
          newGrid[row][col].isWall = true;
        }
      }
    }
    setGrid(newGrid);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Navigation className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Pathfinding Visualizer
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Speed:</label>
                <select
                  value={speed}
                  onChange={(e) =>
                    setSpeed(e.target.value as "fast" | "normal" | "slow")
                  }
                  className="px-2 py-1 border rounded-md text-sm"
                  disabled={isRunning}
                >
                  <option value="fast">Fast</option>
                  <option value="normal">Normal</option>
                  <option value="slow">Slow</option>
                </select>
              </div>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </button>
              <button
                onClick={generateRandomWalls}
                disabled={isRunning}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <GitFork className="w-4 h-4" />
                Random Maze
              </button>
              <button
                onClick={visualizeDijkstra}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Visualize Path
              </button>
              <button
                onClick={resetGrid}
                disabled={isRunning}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Grid
              </button>
            </div>
          </div>

          {showHelp && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    About Dijkstra's Algorithm
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Dijkstra's algorithm is a graph search algorithm that finds
                    the shortest path between nodes in a graph. It works by
                    maintaining a set of unvisited nodes and continuously
                    updating their distances from the start node.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        How it Works:
                      </h4>
                      <ul className="list-disc ml-5 text-blue-800 space-y-2">
                        <li>
                          Starts from the source node and assigns infinity
                          distance to all other nodes
                        </li>
                        <li>
                          Visits the unvisited node with the smallest distance
                        </li>
                        <li>Updates distances to all neighboring nodes</li>
                        <li>Repeats until reaching the target node</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Visualization Guide:
                      </h4>
                      <ul className="list-disc ml-5 text-blue-800 space-y-2">
                        <li>
                          Blue cells show the algorithm's exploration pattern
                        </li>
                        <li>Yellow path shows the shortest route found</li>
                        <li>
                          Black cells are walls that must be navigated around
                        </li>
                        <li>
                          The algorithm guarantees the shortest possible path
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid-container">
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: "flex" }}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isWall } = node;
                  const isStart =
                    row === START_NODE_ROW && col === START_NODE_COL;
                  const isFinish =
                    row === FINISH_NODE_ROW && col === FINISH_NODE_COL;
                  let className = "node";
                  if (isStart) className += " node-start";
                  if (isFinish) className += " node-finish";
                  if (isWall) className += " node-wall";

                  return (
                    <div
                      key={nodeIdx}
                      id={`node-${row}-${col}`}
                      className={className}
                      onMouseDown={() => handleMouseDown(row, col)}
                      onMouseEnter={() => handleMouseEnter(row, col)}
                      onMouseUp={handleMouseUp}
                      onDragStart={(e) => e.preventDefault()}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <h3 className="font-semibold mb-2">Interactive Features:</h3>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Click and drag to draw walls</li>
                  <li>Use "Random Maze" to generate obstacles</li>
                  <li>Adjust visualization speed</li>
                  <li>Watch the algorithm find the optimal path</li>
                </ul>
              </div>
              {(pathLength !== null ||
                visitedNodes !== null ||
                executionTime !== null) && (
                <div className="text-sm text-gray-600">
                  <h3 className="font-semibold mb-2">Path Analysis:</h3>
                  <ul className="space-y-1">
                    {pathLength !== null && (
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Shortest path length: {pathLength - 1} steps
                      </li>
                    )}
                    {visitedNodes !== null && (
                      <li className="flex items-center gap-2">
                        <GitFork className="w-4 h-4 text-blue-500" />
                        Nodes explored: {visitedNodes}
                      </li>
                    )}
                    {executionTime !== null && (
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-500" />
                        Algorithm execution time: {executionTime.toFixed(2)}ms
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <h3 className="font-semibold mb-2">Legend:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                  <span>Start Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500 rounded"></div>
                  <span>Target Node</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-800 rounded"></div>
                  <span>Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                  <span>Shortest Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitialGrid(): Node[][] {
  const grid: Node[][] = [];
  for (let row = 0; row < 20; row++) {
    const currentRow: Node[] = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
}

function createNode(row: number, col: number): Node {
  return {
    row,
    col,
    distance: Infinity,
    isVisited: false,
    previousNode: null,
    isWall: false,
  };
}

function getNewGridWithWallToggled(
  grid: Node[][],
  row: number,
  col: number
): Node[][] {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (row === START_NODE_ROW && col === START_NODE_COL) return newGrid;
  if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) return newGrid;
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
}
