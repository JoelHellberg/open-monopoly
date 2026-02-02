"use client"
import { hostGame, joinGame } from "./session/_lib/client/setup";
import defaultBoard from "@/data/boards/default";
import { useState } from "react";

const COLORS = ["E02B00", "E08A00", "D4E000", "00E048", "00E0B6", "0044E0", "6900E0", "E100A8"];

export default function Home() {
  const [sessionId, setSessionId] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="font-bold">Player Name:</label>
            <input
              type="text"
              placeholder="Enter username"
              className="border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold">Select Color:</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? 'border-black border-4' : 'border-transparent'}`}
                  style={{ backgroundColor: `#${color}` }}
                />
              ))}
            </div>
          </div>

          <div className="border-t my-4"></div>

          <button
            className="outline p-2 rounded-2xl hover:bg-gray-100 cursor-pointer w-full text-left disabled:opacity-50"
            onClick={() => hostGame(defaultBoard, selectedColor, name)}
            disabled={!name}
          >
            Host game
          </button>

          <div className="flex flex-col gap-2 p-4 border rounded-xl">
            <h2 className="text-lg font-bold">Join Game</h2>
            <input
              type="text"
              placeholder="Enter Session ID"
              className="border p-2 rounded uppercase"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={() => joinGame(sessionId, selectedColor, name)}
              disabled={sessionId.length !== 6 || !name}
            >
              Join Game
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
