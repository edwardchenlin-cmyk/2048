import { Grid, Direction } from '../types';

export const createEmptyGrid = (): Grid => {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
};

export const getEmptyCoordinates = (grid: Grid): { x: number; y: number }[] => {
  const coordinates: { x: number; y: number }[] = [];
  grid.forEach((row, x) => {
    row.forEach((value, y) => {
      if (value === 0) {
        coordinates.push({ x, y });
      }
    });
  });
  return coordinates;
};

export const addRandomTile = (grid: Grid): Grid => {
  const emptyCoords = getEmptyCoordinates(grid);
  if (emptyCoords.length === 0) return grid;

  const { x, y } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[x][y] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

// Helper to rotate grid 90 degrees clockwise
const rotateRight = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      newGrid[i][j] = grid[3 - j][i];
    }
  }
  return newGrid;
};

const rotateLeft = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      newGrid[i][j] = grid[j][3 - i];
    }
  }
  return newGrid;
};

// Core logic: slide and merge a single row to the left
const slideRowLeft = (row: number[]): { newRow: number[]; score: number } => {
  let arr = row.filter(val => val !== 0);
  let score = 0;
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  
  while (arr.length < 4) {
    arr.push(0);
  }
  
  return { newRow: arr, score };
};

export const moveLeft = (grid: Grid): { grid: Grid; score: number; moved: boolean } => {
  let totalScore = 0;
  let moved = false;
  const newGrid = grid.map(row => {
    const { newRow, score } = slideRowLeft(row);
    totalScore += score;
    if (newRow.join(',') !== row.join(',')) moved = true;
    return newRow;
  });
  return { grid: newGrid, score: totalScore, moved };
};

export const moveGrid = (grid: Grid, direction: Direction): { grid: Grid; score: number; moved: boolean } => {
  let tempGrid = grid.map(row => [...row]);
  let score = 0;
  let moved = false;

  // Transform grid so we can always just "move left"
  if (direction === Direction.RIGHT) {
    tempGrid = tempGrid.map(row => row.reverse());
    const result = moveLeft(tempGrid);
    score = result.score;
    moved = result.moved;
    tempGrid = result.grid.map(row => row.reverse());
  } else if (direction === Direction.UP) {
    tempGrid = rotateLeft(tempGrid);
    const result = moveLeft(tempGrid);
    score = result.score;
    moved = result.moved;
    tempGrid = rotateRight(result.grid);
  } else if (direction === Direction.DOWN) {
    tempGrid = rotateRight(tempGrid);
    const result = moveLeft(tempGrid);
    score = result.score;
    moved = result.moved;
    tempGrid = rotateLeft(result.grid);
  } else {
    // LEFT
    const result = moveLeft(tempGrid);
    score = result.score;
    moved = result.moved;
    tempGrid = result.grid;
  }

  return { grid: tempGrid, score, moved };
};

export const isGameOver = (grid: Grid): boolean => {
  // Check for empty cells
  if (getEmptyCoordinates(grid).length > 0) return false;

  // Check for possible merges
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const val = grid[i][j];
      // Check right
      if (j < 3 && grid[i][j + 1] === val) return false;
      // Check down
      if (i < 3 && grid[i + 1][j] === val) return false;
    }
  }
  return true;
};

export const hasWon = (grid: Grid): boolean => {
  return grid.some(row => row.some(val => val >= 2048));
};