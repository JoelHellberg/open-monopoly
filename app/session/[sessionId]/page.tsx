"use client";
import { useEffect } from "react";
import ActionsDisplay from "../board/actionsDisplay";
import GameBoard from "../board/gameboard";
import GameChat from "../chat/gameChat";
import PropertiesDisplay from "../propertiesDisplay";
import TurnDisplay from "../turnDisplay";
import { useGameData } from "../_lib/data/gameData";
import { useParams } from "next/navigation";
import { onValue, ref, off } from "firebase/database";
import { rtdb } from "@/app/_lib/firebase";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const updateGameData = useGameData((state) => state.update);

  useEffect(() => {
    if (!sessionId) return;

    const gameRef = ref(rtdb, `games/${sessionId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const playersArray = data.playersInSession
          ? Object.keys(data.playersInSession)
          : [];

        const updatedData = { ...data, playersInSession: playersArray };
        updateGameData(updatedData);
      }
    });

    return unsubscribe;
  }, [sessionId]);

  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex h-screen w-screen gap-3 p-2 [&>div]:rounded-lg">
        <div className="bg-yellow-400 flex flex-1">
          <GameChat />
        </div>
        <div className="relative h-full aspect-square bg-pink-400">
          <ActionsDisplay />
          <GameBoard />
        </div>
        <div className="bg-blue-400 flex flex-col flex-1 gap-5">
          <TurnDisplay />
          <div className="flex flex-col flex-2 bg-red-400 rounded-lg">
            <PropertiesDisplay />
          </div>
        </div>
      </main>
    </div>
  );
}
