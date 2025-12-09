import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCcw, Trophy, BrainCircuit, AlertCircle, Info } from 'lucide-react';
import { Grid, Direction } from './types';
import { createEmptyGrid, addRandomTile, moveGrid, isGameOver, hasWon } from './utils/gameLogic';
import Tile from './components/Tile';
import { getGeminiHint } from './services/geminiService';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  
  // Ref for touch handling
  const touchStart = useRef<{ x: number, y: number } | null>(null);

  // Initialize Game
  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setHint(null);
  }, []);

  useEffect(() => {
    initGame();
    const savedBest = localStorage.getItem('2048-best-score');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
  }, [initGame]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('2048-best-score', score.toString());
    }
  }, [score, bestScore]);

  const handleMove = useCallback((direction: Direction) => {
    if (gameOver) return;

    setGrid(prevGrid => {
      const { grid: newGrid, score: points, moved } = moveGrid(prevGrid, direction);
      
      if (moved) {
        const gridWithRandom = addRandomTile(newGrid);
        setScore(prev => prev + points);
        
        if (hasWon(gridWithRandom) && !won) {
          setWon(true); // Continue playing allowed
        }
        
        if (isGameOver(gridWithRandom)) {
          setGameOver(true);
        }
        
        // Clear hint on move
        setHint(null);
        return gridWithRandom;
      }
      return prevGrid;
    });
  }, [gameOver, won]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowUp': handleMove(Direction.UP); break;
        case 'ArrowDown': handleMove(Direction.DOWN); break;
        case 'ArrowLeft': handleMove(Direction.LEFT); break;
        case 'ArrowRight': handleMove(Direction.RIGHT); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStart.current.x;
    const diffY = touchEndY - touchStart.current.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) { // Threshold
        handleMove(diffX > 0 ? Direction.RIGHT : Direction.LEFT);
      }
    } else {
      if (Math.abs(diffY) > 30) {
        handleMove(diffY > 0 ? Direction.DOWN : Direction.UP);
      }
    }
    touchStart.current = null;
  };

  const getHint = async () => {
    if (gameOver) return;
    setLoadingHint(true);
    setHint("Thinking...");
    try {
      const advice = await getGeminiHint(grid, score);
      setHint(advice);
    } catch (e) {
      setHint("Failed to get hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ef] text-[#776e65] flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="w-full max-w-md flex flex-col mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-6xl font-extrabold text-[#776e65]">2048</h1>
          <div className="flex space-x-2">
            <div className="bg-[#bbada0] rounded-md p-2 min-w-[80px] text-center">
              <div className="text-[#eee4da] text-xs font-bold uppercase tracking-wider">Score</div>
              <div className="text-white font-bold text-xl">{score}</div>
            </div>
            <div className="bg-[#bbada0] rounded-md p-2 min-w-[80px] text-center">
              <div className="text-[#eee4da] text-xs font-bold uppercase tracking-wider">Best</div>
              <div className="text-white font-bold text-xl">{bestScore}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-[#776e65] text-lg">Join the numbers to get <span className="font-bold">2048!</span></p>
          <button 
            onClick={initGame}
            className="bg-[#8f7a66] hover:bg-[#9f8b77] text-white font-bold py-2 px-4 rounded transition-colors flex items-center gap-2"
          >
            <RefreshCcw size={18} /> New Game
          </button>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative">
        <div 
          className="bg-[#bbada0] p-3 rounded-xl w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] grid grid-cols-4 grid-rows-4 gap-3 relative select-none touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, rowIndex) => (
            row.map((val, colIndex) => (
              <Tile key={`${rowIndex}-${colIndex}`} value={val} />
            ))
          ))}
          
          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-[#eee4da]/70 z-20 flex flex-col items-center justify-center rounded-xl animate-fade-in">
              <h2 className="text-5xl font-extrabold text-[#776e65] mb-4">Game Over!</h2>
              <button onClick={initGame} className="bg-[#8f7a66] text-white font-bold py-3 px-6 rounded text-xl shadow-lg hover:scale-105 transition-transform">
                Try Again
              </button>
            </div>
          )}
          
          {won && !gameOver && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="bg-yellow-500/90 text-white px-8 py-4 rounded-xl shadow-2xl animate-bounce-slow pointer-events-auto flex flex-col items-center">
                <span className="text-3xl font-bold mb-2 flex items-center gap-2"><Trophy /> You Win!</span>
                <span className="text-sm opacity-90 mb-4">You reached 2048!</span>
                <button 
                  onClick={() => setWon(false)}
                  className="bg-white text-yellow-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                >
                  Keep Playing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls & AI */}
      <div className="w-full max-w-md mt-6 flex flex-col gap-4">
        <div className="bg-[#eee4da] rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-[#776e65] flex items-center gap-2">
                    <BrainCircuit size={20}/> AI Assistant
                </h3>
                <button 
                    onClick={getHint} 
                    disabled={loadingHint || gameOver}
                    className={`text-sm px-3 py-1 rounded-md font-medium transition-all ${
                        loadingHint 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm'
                    }`}
                >
                    {loadingHint ? 'Thinking...' : 'Get Hint'}
                </button>
            </div>
            
            {hint ? (
                <div className="bg-white/50 p-3 rounded text-sm text-[#776e65] animate-in fade-in slide-in-from-top-2 border-l-4 border-indigo-500">
                    {hint}
                </div>
            ) : (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                   <Info size={14} /> Stuck? Ask Gemini for the best next move.
                </div>
            )}
            
            {!process.env.API_KEY && (
                 <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} /> API Key missing. Hints disabled.
                </div>
            )}
        </div>

        <div className="text-[#776e65] text-sm text-center">
          <p className="mb-2"><strong>How to play:</strong> Use your <strong>arrow keys</strong> or <strong>swipe</strong> to move the tiles. Tiles with the same number merge into one!</p>
        </div>
      </div>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.2s ease-in-out;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.8s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;