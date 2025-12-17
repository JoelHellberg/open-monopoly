"use client";
import { useGameData } from "../../_lib/data/gameData";
import PlayerDisplay from "./playerDisplay";

type Props = {
  streetsPerSide: number;
  streetsBetweenCorners: number;
};

export default function PlayersDisplay(props: Props) {
  const players = useGameData((state) => state.data?.playersInSession);
  return (
    <>
      {players &&
        players.map((playerId) => (
          <PlayerDisplay
            key={playerId}
            playerId_in={playerId}
            streetsPerSide={props.streetsPerSide}
            streetsBetweenCorners={props.streetsBetweenCorners}
          />
        ))}
    </>
  );
}
