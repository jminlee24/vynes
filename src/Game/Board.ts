// Solver from https://customstrandsnyt.com/about
// Thank you chatgpt :D

export type boardNode = {
  id: number;
  char: string;
};

const ROWS = 9;
const COLS = 6;
const TOTAL = ROWS * COLS;

type Pos = [number, number];

const directions: Pos[] = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

/* -------------------- UTILS -------------------- */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* -------------------- GRID -------------------- */

function createGrid(): boolean[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => true)
  );
}

function createBoard(): boardNode[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      id: -1,
      char: "",
    }))
  );
}

/* -------------------- BFS CONNECTIVITY -------------------- */

function bfs(grid: boolean[][], start: Pos): Set<string> {
  const q: Pos[] = [start];
  const seen = new Set<string>();

  while (q.length) {
    const [x, y] = q.pop()!;

    if (
      x < 0 || y < 0 ||
      x >= ROWS || y >= COLS ||
      !grid[x][y]
    ) continue;

    const key = `${x},${y}`;
    if (seen.has(key)) continue;

    seen.add(key);

    for (const [dx, dy] of directions) {
      q.push([x + dx, y + dy]);
    }
  }

  return seen;
}

function isConnected(grid: boolean[][]): boolean {
  let start: Pos | null = null;
  let total = 0;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (grid[i][j]) {
        total++;
        if (!start) start = [i, j];
      }
    }
  }

  if (!start) return true;

  return bfs(grid, start).size === total;
}

/* -------------------- SPANGRAM PLACEMENT -------------------- */

function placeSpangram(word: string, grid: boolean[][]): Pos[] | null {
  const startRow = Math.floor(Math.random() * ROWS);

  const start: Pos = [startRow, 0];
  const end: Pos = [startRow, COLS - 1];

  const path: Pos[] = [start];
  grid[start[0]][start[1]] = false;

  function dfs(x: number, y: number, i: number): boolean {
    if (i === word.length) {
      return x === end[0] && y === end[1];
    }

    for (const [dx, dy] of shuffle(directions)) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 && ny >= 0 &&
        nx < ROWS && ny < COLS &&
        grid[nx][ny]
      ) {
        grid[nx][ny] = false;
        path.push([nx, ny]);

        if (dfs(nx, ny, i + 1)) return true;

        path.pop();
        grid[nx][ny] = true;
      }
    }

    return false;
  }

  return dfs(start[0], start[1], 1) ? path : null;
}

/* -------------------- WORD PLACEMENT -------------------- */

function placeWord(
  board: boardNode[][],
  word: string,
  id: number
): boolean {
  function dfs(x: number, y: number, i: number): boolean {
    if (i === word.length) return true;

    for (const [dx, dy] of shuffle(directions)) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        nx >= 0 && ny >= 0 &&
        nx < ROWS && ny < COLS &&
        board[nx][ny].id === -1
      ) {
        board[nx][ny] = { id, char: word[i] };

        if (dfs(nx, ny, i + 1)) return true;

        board[nx][ny] = { id: -1, char: "" };
      }
    }

    return false;
  }

  for (let t = 0; t < 60; t++) {
    const x = Math.floor(Math.random() * ROWS);
    const y = Math.floor(Math.random() * COLS);

    if (board[x][y].id === -1) {
      board[x][y] = { id, char: word[0] };

      if (dfs(x, y, 1)) return true;

      board[x][y] = { id: -1, char: "" };
    }
  }

  return false;
}

/* -------------------- MAIN GENERATOR -------------------- */

export function generateBoard(words: string[]): boardNode[][] {
  const totalLetters = words.reduce((a, w) => a + w.length, 0);

  if (totalLetters !== TOTAL) {
    throw new Error(`Words must sum to ${TOTAL} letters for 6x9 grid`);
  }

  for (let attempt = 0; attempt < 1000; attempt++) {
    const grid = createGrid();
    const board = createBoard();

    const spangram = words[0];

    const path = placeSpangram(spangram, grid);
    if (!path) continue;

    if (!isConnected(grid)) continue;

    // place spangram
    for (let i = 0; i < path.length; i++) {
      const [x, y] = path[i];
      board[x][y] = {
        id: 0,
        char: spangram[i],
      };
    }

    const remaining = shuffle(words.slice(1));

    let ok = true;

    for (let i = 0; i < remaining.length; i++) {
      if (!placeWord(board, remaining[i], i + 1)) {
        ok = false;
        break;
      }
    }

    if (!ok) continue;

    return board;
  }

  throw new Error("Failed to generate valid 6x9 board after many attempts");
}
