"use client"
import { hostGame, joinGame } from "./session/_lib/client/setup";
import defaultBoard from "@/data/boards/default";
import { useState } from "react";

export default function Home() {
  const [sessionId, setSessionId] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4">
          <button
            className="outline p-2 rounded-2xl hover:bg-gray-100 cursor-pointer"
            onClick={() => hostGame(defaultBoard)}
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
              onClick={() => joinGame(sessionId)}
              disabled={sessionId.length !== 6}
            >
              Join Game
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
