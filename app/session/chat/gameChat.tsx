"use client";
import GameMessage from "./gameMessage";
import { useGameData } from "../_lib/data/gameData";
import { useState } from "react";
import { sendChatMessage } from "../_lib/server/actions";
import { useParams } from "next/navigation";

export default function GameChat() {
  const { sessionId } = useParams() as { sessionId: string };
  const gameData = useGameData((s) => s.data);
  const players = useGameData((s) => s.players);
  const [inputValue, setInputValue] = useState("");

  const messages = gameData?.gameChatMessages ?? {};
  const sortedMessages = Object.entries(messages).sort(
    ([, a], [, b]) => a.timeStamp - b.timeStamp
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue("");
    await sendChatMessage(sessionId, message);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full p-6 h-8 bg-black text-white flex items-center justify-center rounded-t-lg">
        Chat
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto gap-2 p-2 bg-blue-900 min-h-[200px]">
        {sortedMessages.map(([id, msg]) => (
          <GameMessage
            key={id}
            messageContent={msg.messageContent}
            sender={players?.[msg.playerId]?.name ?? msg.playerId}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full p-6 h-8 bg-black text-white flex items-center justify-center rounded-b-lg"
      >
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Write message here.."
          className="outline-none w-full bg-transparent border-none text-white"
        />
      </form>
    </div>
  );
}
