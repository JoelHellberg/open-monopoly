"use client";
import { useGameData } from "./_lib/data/gameData";

export default function TurnDisplay() {
  const playersInSession = useGameData((state) => state.data?.playersInSession);
  const players = useGameData((state) => state.players);

  return (
    <div className="flex flex-col flex-1 bg-green-400 rounded-lg">
      {playersInSession &&
        players &&
        playersInSession.map((playerId) => {
          const player = players[playerId];
          if (!player) return null;

          return (
            <Player
              key={playerId}
              username={playerId}
              money={player.money}
              color={player.color}
            />
          );
        })}
    </div>
  );
}

function Player(props: { username: string; money: number; color: string }) {
  return (
    <div className="flex w-full items-center gap-2 bg-green-500 px-2 py-1 rounded-lg">
      <div className="h-4 aspect-square rounded-full" style={{ backgroundColor: props.color }} />
      <p className="flex-1">{props.username}</p>
      <p className="text-sm font-semibold">${props.money}</p>
    </div>
  );
}