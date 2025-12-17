"use client"
import Image from "next/image";
import { hostGame } from "./session/_lib/client/setup";
import defaultBoard from "@/data/boards/default";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <button
          className="outline p-2 rounded-2xl hover:bg-gray-100 cursor-pointer"
          onClick={() => hostGame(defaultBoard)}
        >
          Host game
        </button>
      </main>
    </div>
  );
}
