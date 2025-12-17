"use client";
import { useGameData } from "./_lib/data/gameData";

export default function TurnDisplay() {
  const players = useGameData((state) => state.data?.playersInSession);
  return (
    <div className="flex flex-col flex-1 bg-green-400 rounded-lg">
      {players &&
        players.map((playerId) => (
          <Player key={playerId} username={playerId} />
        ))}
    </div>
  );
}

function Player(props: { username: string }) {
  return (
    <div className="flex w-full bg-yellow-400 opacity-50 items-center">
      <div className="h-4 aspect-square bg-red-400 rounded-full" />
      <p>{props.username}</p>
    </div>
  );
}
