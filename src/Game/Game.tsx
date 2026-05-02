import gamedata from "./Gamedata.json";
import "./Game.css"

import { useEffect, useState, useRef } from "react"
import { generateBoard, type boardNode } from "./Board";

function getWordFromCurr(curr: { row: number, col: number }[], board: boardNode[][]): string {
  let str = ""
  for (let circle of curr) {
    const sqr = board[circle.row][circle.col]
    str = str.concat(sqr.char)
    console.log(sqr.id)

  }
  return str
}

function Game() {
  const [isWin, setIsWin] = useState<boolean>(false);
  const [foundWords, setFoundWords] = useState<number>(0);
  const [currWord, setCurrWord] = useState<{ row: number, col: number }[]>([]);
  const [completedWords, setCompletedWords] = useState<{ row: number, col: number }[][]>([]);
  const [board, _setBoard] = useState(generateBoard(gamedata.words));
  const [isDragging, setIsDragging] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  const start = (row: number, col: number) => {
    setCurrWord([{ row, col }]);
    setIsDragging(true);
  };

  const extend = (row: number, col: number) => {
    if (!isDragging) return;

    setCurrWord(prev => {
      const last = prev[prev.length - 1];

      // prevent duplicates
      const alreadyUsed = prev.some(p => p.row === row && p.col === col)
        || completedWords.reduce((acc, prev) => prev.some(p => p.row === row && p.col === col) || acc, false);
      if (alreadyUsed) return prev;

      // adjacency check
      const isAdjacent =
        Math.abs(last.row - row) <= 1 &&
        Math.abs(last.col - col) <= 1;

      if (!isAdjacent) return prev;

      return [...prev, { row, col }];
    });
  };

  const end = () => {
    setIsDragging(false);
    if (currWord.length < 1) {
      setCurrWord([])
      return;
    }

    let sqr = board[currWord[0].row][currWord[0].col]
    let id = sqr.id
    let str = getWordFromCurr(currWord, board);
    console.log(str)
    for (let n of currWord) {
      if (id != board[n.row][n.col].id) {
        setCurrWord([])
        return;
      }
    }
    console.log('heuh')
    const match = gamedata.words.find(w => w === str);
    if (match) {
      setCompletedWords((prev) => [...prev, currWord])
      setFoundWords(prev => prev + 1);
    }
    console.log(gamedata.words[id])

    setCurrWord([])

  };
  useEffect(() => {
    if (foundWords === gamedata.words.length) {
      setIsWin(true);
    }
  }, [foundWords]);
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (!boardRef.current) return;

      const rect = boardRef.current.getBoundingClientRect();

      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!inside) {
        end();
        return;
      }
    };
    window.addEventListener("click", handleMove);
    return () =>
      window.removeEventListener("click", handleMove);
  }, []);

  useEffect(() => {
    const handleUp = () => {
      setIsDragging(false);
      end();
    }

    window.addEventListener("pointerup", handleUp);

    return () => window.removeEventListener("pointerup", handleUp);
  }, []);

  return (
    <>
      <div className={`game-container ${isWin ? "blurred" : ""}`}>
        <div className="board-wrapper">
          <svg className="line-layer" >
            {currWord.map((cell, i) => {
              if (i === 0) return null;

              const prev = currWord[i - 1];

              return (
                <line
                  key={i}
                  x1={prev.col * 60 + 30}
                  y1={prev.row * 60 + 30}
                  x2={cell.col * 60 + 30}
                  y2={cell.row * 60 + 30}
                  stroke="var(--color-primary)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              );
            })}
            {completedWords.map((w, wi) =>
              w.map((cell, i) => {
                if (i === 0) return null;

                const prev = w[i - 1];

                return (
                  <line
                    key={`${wi}-${i}`}
                    x1={prev.col * 60 + 30}
                    y1={prev.row * 60 + 30}
                    x2={cell.col * 60 + 30}
                    y2={cell.row * 60 + 30}
                    stroke="var(--color-secondary)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                );
              })
            )}
          </svg>
          <div className="board" ref={boardRef}>
            {board.map((row, j) =>
              row.map((cell, i) => {
                const selected = currWord.some(
                  c => c.row === j && c.col === i
                );
                const correct = completedWords.reduce((acc, prev) => {
                  if (prev.some(c => c.row === j && c.col === i)) {
                    return true
                  }
                  return acc;
                }, false)
                return (
                  <div
                    className="char"
                    key={`${j}-${i}`}
                  >
                    <div
                      className={(selected ? "char-selected" : "") + " " + (correct ? "char-correct" : "")}
                      onPointerDown={() => start(j, i)}
                      onPointerEnter={() => extend(j, i)}
                      onPointerUp={end}
                    >
                      {cell.char}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="word-tracker">{getWordFromCurr(currWord, board)}</div>
        <div className="tracker">
          {foundWords.toString()} of {gamedata.words.length} theme words found.
        </div>
      </div >
      {
        isWin && (
          <div className="win-overlay">
            <div className="win-modal">
              <h1>You Win!</h1>
              <p>Happy Birthday Vivian!</p>
              <img src="IMG_1409.jpg" height="550" width="400" />
              <button onClick={() => window.location.reload()}>
                Play Again
              </button>
            </div>
          </div>
        )
      }</>

  )

}

export default Game;
