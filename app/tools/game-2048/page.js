'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Trophy, Share2, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Grid3x3, Info } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const GRID_SIZE = 4;
const STORAGE_KEY = '2048-game-state';
const HIGH_SCORE_KEY = '2048-high-score';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

// Tile Colors based on value
const getTileStyles = (value) => {
    const styles = {
        0: 'bg-slate-200/50 dark:bg-slate-700/30 text-transparent',
        2: 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-white',
        4: 'bg-slate-200 text-slate-700 dark:bg-slate-500 dark:text-white',
        8: 'bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white',
        16: 'bg-orange-200 text-orange-800 dark:bg-orange-500 dark:text-white',
        32: 'bg-orange-300 text-white dark:bg-orange-400',
        64: 'bg-orange-400 text-white dark:bg-orange-300',
        128: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.3)]',
        256: 'bg-yellow-300 text-yellow-900 dark:bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
        512: 'bg-yellow-400 text-white dark:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        1024: 'bg-yellow-500 text-white dark:bg-yellow-300 shadow-[0_0_25px_rgba(234,179,8,0.6)]',
        2048: 'bg-yellow-600 text-white dark:bg-yellow-200 dark:text-yellow-900 shadow-[0_0_30px_rgba(234,179,8,0.8)] ring-2 ring-yellow-400 animate-pulse',
    };
    return styles[value] || 'bg-slate-900 text-white shadow-[0_0_35px_rgba(0,0,0,0.5)]';
};

const getFontSize = (value) => {
    if (value < 100) return 'text-3xl font-black';
    if (value < 1000) return 'text-2xl font-black';
    return 'text-xl font-black';
};

export default function Game2048() {
    const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize game
    const initGame = useCallback(() => {
        let newGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        newGrid = spawnTile(newGrid);
        newGrid = spawnTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
        setWon(false);
    }, []);

    // Spawn a random tile (2 or 4)
    const spawnTile = (currentGrid) => {
        const emptyTiles = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentGrid[r][c] === 0) emptyTiles.push({ r, c });
            }
        }
        if (emptyTiles.length === 0) return currentGrid;

        const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    };

    // Move Logic
    const move = useCallback((direction) => {
        if (gameOver) return;

        let newGrid = grid.map(row => [...row]);
        let moved = false;
        let points = 0;

        const rotateGrid = (grid) => grid[0].map((_, colIdx) => grid.map(row => row[colIdx]).reverse());

        if (direction === 'UP') {
            newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid))); // Rotate 270 deg
        } else if (direction === 'RIGHT') {
            newGrid = rotateGrid(rotateGrid(newGrid)); // Rotate 180 deg
        } else if (direction === 'DOWN') {
            newGrid = rotateGrid(newGrid); // Rotate 90 deg
        }

        // Process Left movement on the (possibly rotated) grid
        for (let r = 0; r < GRID_SIZE; r++) {
            let row = newGrid[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    points += row[i];
                    row.splice(i + 1, 1);
                    moved = true;
                    if (row[i] === 2048) setWon(true);
                }
            }
            const newRow = row.concat(Array(GRID_SIZE - row.length).fill(0));
            if (JSON.stringify(newGrid[r]) !== JSON.stringify(newRow)) moved = true;
            newGrid[r] = newRow;
        }

        // Rotate back
        if (direction === 'UP') {
            newGrid = rotateGrid(newGrid);
        } else if (direction === 'RIGHT') {
            newGrid = rotateGrid(rotateGrid(newGrid));
        } else if (direction === 'DOWN') {
            newGrid = rotateGrid(rotateGrid(rotateGrid(newGrid)));
        }

        if (moved) {
            const finalGrid = spawnTile(newGrid);
            setGrid(finalGrid);
            setScore(prev => prev + points);
            if (checkGameOver(finalGrid)) setGameOver(true);
        }
    }, [grid, gameOver]);

    const checkGameOver = (currentGrid) => {
        // Check for empty tiles
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentGrid[r][c] === 0) return false;
            }
        }
        // Check for adjacent merges
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (r < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r + 1][c]) return false;
                if (c < GRID_SIZE - 1 && currentGrid[r][c] === currentGrid[r][c + 1]) return false;
            }
        }
        return true;
    };

    // Load/Save state
    useEffect(() => {
        const savedBest = localStorage.getItem(HIGH_SCORE_KEY);
        if (savedBest) setBestScore(parseInt(savedBest));

        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const { grid: g, score: s, gameOver: go, won: w } = JSON.parse(savedState);
                setGrid(g);
                setScore(s);
                setGameOver(go);
                setWon(w);
            } catch (e) {
                initGame();
            }
        } else {
            initGame();
        }
        setIsInitialized(true);
    }, [initGame]);

    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ grid, score, gameOver, won }));
        if (score > bestScore) {
            setBestScore(score);
            localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        }
    }, [grid, score, bestScore, gameOver, won, isInitialized]);

    // Keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); move('UP'); }
            else if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); move('DOWN'); }
            else if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); move('LEFT'); }
            else if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); move('RIGHT'); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    const shareScore = () => {
        const text = `I just scored ${score} points in 2048! Can you beat me? 🎮\n\nPlay here: ${window.location.href}`;
        if (navigator.share) {
            navigator.share({ title: '2048 High Score', text, url: window.location.href });
        } else {
            navigator.clipboard.writeText(text);
            alert('Score copied to clipboard!');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-xl mx-auto">
                <Breadcrumbs items={[{ name: '2048 Game', href: '/tools/game-2048' }]} />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-none">2048</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Merge tiles to reach 2048!</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-xl text-center min-w-[80px]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{score}</p>
                        </div>
                        <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-xl text-center min-w-[80px]">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Best</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{bestScore}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={initGame} className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <RotateCcw className="w-4 h-4" /> New Game
                    </button>
                    <button onClick={shareScore} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Game Grid */}
                <div className="relative aspect-square w-full bg-slate-300 dark:bg-slate-800 rounded-2xl p-3 shadow-inner">
                    <div className="grid grid-cols-4 grid-rows-4 gap-3 h-full">
                        {grid.map((row, r) => row.map((value, c) => (
                            <div key={`${r}-${c}`} className={`relative flex items-center justify-center rounded-xl transition-all duration-100 ${getTileStyles(value)}`}>
                                <span className={getFontSize(value)}>{value !== 0 ? value : ''}</span>
                            </div>
                        )))}
                    </div>

                    {/* Overlays */}
                    {(gameOver || won) && (
                        <div className="absolute inset-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-center items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-300">
                            <div>
                                {won && !gameOver && <div className="mb-2"><Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" /></div>}
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                                    {won ? 'You Win!' : 'Game Over!'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
                                    {won ? `Amazing! You reached 2048 with ${score} points.` : `Nice try! Your final score was ${score}.`}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button onClick={initGame} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition shadow-lg shadow-orange-500/25">
                                        Try Again
                                    </button>
                                    {won && !gameOver && (
                                        <button onClick={() => setWon(false)} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-2xl font-bold transition">
                                            Keep Playing
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Instructions (Visible on touch devices) */}
                <div className="mt-8 grid grid-cols-2 gap-4 md:hidden">
                    <div className={`${cardCls} p-4 flex items-center gap-3`}>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><Info className="w-5 h-5 text-slate-500" /></div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Swipe to move tiles</p>
                    </div>
                    <div className={`${cardCls} p-4 flex items-center gap-3`}>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"><RotateCcw className="w-5 h-5 text-slate-500" /></div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Shake to reset</p>
                    </div>
                </div>

                {/* Desktop Controls Info */}
                <div className="mt-8 hidden md:flex justify-center gap-8 text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-2"><ArrowUp className="w-4 h-4" /><ArrowDown className="w-4 h-4" /><ArrowLeft className="w-4 h-4" /><ArrowRight className="w-4 h-4" /> <span className="text-sm font-bold">Arrow Keys to Slide</span></div>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-12 space-y-6">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About 2048 — The Classic Puzzle Game</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            2048 is an addictive single-player sliding tile puzzle game created by Gabriele Cirulli. The objective is to slide numbered tiles on a grid to combine them to create a tile with the number 2048. However, one can continue to play the game after reaching the target, creating tiles with larger numbers.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            It's played on a plain 4×4 grid, with numbered tiles that slide when a player moves them using the four arrow keys. Every turn, a new tile randomly appears in an empty spot on the board with a value of either 2 or 4. Tiles slide as far as possible in the chosen direction until they are stopped by either another tile or the edge of the grid.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Our version of 2048 is optimized for performance and privacy. It runs entirely in your browser, saves your high score automatically, and features a smooth, premium UI that looks great in both light and dark modes.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">How to Play & Win</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Sliding Tiles', c: 'text-orange-600 dark:text-orange-400', b: 'Use your arrow keys (Up, Down, Left, Right) to slide all tiles in that direction.' },
                                { t: 'Merging Rules', c: 'text-red-600 dark:text-red-400', b: 'When two tiles with the same number collide while moving, they merge into one tile with the sum of their values.' },
                                { t: 'Scoring Points', c: 'text-emerald-600 dark:text-emerald-400', b: 'Every time you merge two tiles, the value of the new tile is added to your score.' },
                                { t: 'Winning the Game', c: 'text-blue-600 dark:text-blue-400', b: 'The game is won when a tile with a value of 2048 appears on the board.' },
                                { t: 'Corner Strategy', c: 'text-violet-600 dark:text-violet-400', b: 'A popular strategy is to keep your highest number tile in one of the corners and build around it.' },
                                { t: 'Plan Ahead', c: 'text-amber-600 dark:text-amber-400', b: 'Try to predict where new tiles might appear and how your move will affect the entire board.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is 2048 free to play?', a: 'Yes, our version of 2048 is completely free and contains no ads or trackers.' },
                                { q: 'Does the game save my progress?', a: 'Yes! We use localStorage to save your current board and your all-time high score.' },
                                { q: 'Can I play 2048 offline?', a: 'Once the page is loaded, the game logic runs entirely on your device, allowing you to play even without an internet connection.' },
                                { q: 'What is the highest possible tile?', a: 'The theoretical limit on a 4x4 board is the 131,072 tile, but reaching it is extremely difficult!' },
                                { q: 'What is a good score in 2048?', a: 'Reaching 2048 usually requires a score between 20,000 and 25,000 points. Skilled players often reach 50,000+.' },
                                { q: 'Is there an "undo" button?', a: 'In this classic version, there is no undo. Every move counts, so plan carefully!' },
                            ].map(({ q, a }) => (
                                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                        <span>{q}</span>
                                        <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                                    </summary>
                                    <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
