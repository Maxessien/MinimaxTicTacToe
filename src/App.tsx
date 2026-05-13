import { useState } from "react";
import LeafStatPopup from "./LeafStatPopup";
import { BoardWithPlayers, Player, type BoardFieldVal } from "./utils/board";

const board = new BoardWithPlayers();

const App = () => {
  const [boardState, setBoardState] = useState({
    state: board.getState(),
    value: board.checkStateValue(),
  });
  const [currentPlayer, setCurrentPlayer] = useState({
    player: board.getPlayers()[0],
    idx: 0,
  });

  const play = (player: Player, position: BoardFieldVal) => {
    const p = player.play(position);
    console.log(p);
    const newCurrplayerIdx = currentPlayer.idx === 0 ? 1 : 0;
    setCurrentPlayer({
      player: board.getPlayers()[newCurrplayerIdx],
      idx: newCurrplayerIdx,
    });
    setBoardState({ state: board.getState(), value: board.checkStateValue() });
  };

  const valueMap: { [key: string]: "win" | "lose" | "draw" } = {
    "1": "win",
    "-1": "lose",
    "0": "draw",
  };

  const resetGame = () => {
    board.resetBoard();
    setCurrentPlayer({ player: board.getPlayers()[0], idx: 0 });
    console.log(board.getState())
    setBoardState({ state: board.getState(), value: board.checkStateValue() });
  };

  return (
    <>
      {boardState.value && (
        <LeafStatPopup onRestart={resetGame} status={valueMap[boardState.value.toString()]} />
      )}
      <div className="min-h-screen bg-linear-to-br from-(--bg-app-from) via-(--bg-app-via) to-(--bg-app-to) flex items-center justify-center font-sans text-white p-4">
        <div className="max-w-md w-full flex flex-col items-center gap-8">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-(--text-header-from) to-(--text-header-to) drop-shadow-md">
              Tic Tac Toe
            </h1>
            <p className="text-(--text-primary) font-medium tracking-wide uppercase text-sm">
              Powered by Minimax
            </p>
          </div>

          {/* Turn Indicator / Scoreboard */}
          <div className="w-full flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-white/10">
            <div className="flex flex-col items-center gap-1 w-1/3">
              <span className="text-xs text-(--text-primary) font-bold uppercase tracking-widest">
                Player
              </span>
              <span className="text-3xl font-black text-(--color-player-x) drop-shadow-md">
                X
              </span>
            </div>

            <div className="flex flex-col items-center justify-center w-1/3">
              <span className="text-[10px] uppercase tracking-widest text-(--text-primary-dim) mb-1">
                Status
              </span>
              <span className="px-3 py-1 rounded-full bg-(--badge-bg) text-(--badge-text) text-xs font-bold border border-(--badge-border)">
                {currentPlayer.idx === 0 ? "Your Turn" : "AI turn"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 w-1/3">
              <span className="text-xs text-(--text-primary) font-bold uppercase tracking-widest">
                Minimax AI
              </span>
              <span className="text-3xl font-black text-(--color-player-o) drop-shadow-md">
                O
              </span>
            </div>
          </div>

          {/* Board Container */}
          <div className="bg-white/5 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-2xl border border-white/10">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {boardState.state.map((row, rIndex) =>
                row.map((cell, cIndex) => (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    className="w-20 h-20 md:w-24 md:h-24 bg-white/5 hover:bg-white/15 transition-all duration-300 rounded-2xl flex items-center justify-center text-5xl md:text-6xl shadow-inner border border-white/5 group relative overflow-hidden"
                  >
                    {/* Hover effect highlight */}
                    <div
                      onClickCapture={() =>
                        play(currentPlayer.player, { col: cIndex, row: rIndex })
                      }
                      className="absolute inset-0 bg-linear-to-tr from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    {cell?.val === "X" && (
                      <span className="text-(--color-player-x) font-black drop-shadow-(--shadow-player-x) transform transition-transform duration-300 hover:scale-110">
                        X
                      </span>
                    )}
                    {cell?.val === "O" && (
                      <span className="text-(--color-player-o) font-black drop-shadow-(--shadow-player-o) transform transition-transform duration-300 hover:scale-110">
                        O
                      </span>
                    )}
                  </button>
                )),
              )}
            </div>
          </div>

          {/* Action Controls */}
          <button className="mt-4 px-10 py-4 bg-linear-to-r from-(--btn-from) hover:from-(--btn-hover-from) to-(--btn-to) hover:to-(--btn-hover-to) text-white font-bold rounded-full shadow-lg transition-all duration-300 active:scale-95 tracking-wider uppercase text-sm border border-white/10">
            Restart Match
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
