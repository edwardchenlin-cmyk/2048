export type Grid = number[][];

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

export type TileType = {
  id: string; // Unique ID for animation keys (conceptually)
  val: number;
  x: number;
  y: number;
}