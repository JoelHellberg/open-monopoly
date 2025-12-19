import { Ownable, Player } from "@/types/gameTypes";
import { useGameData } from "./_lib/data/gameData";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../_lib/firebase";

export default function PropertiesDisplay() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const ownPlayerId: string = useGameData((state) => state.ownPlayerId);

  const [playerData, setPlayerData] = useState<Player | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const gameRef = ref(rtdb, `games/${sessionId}/players/${ownPlayerId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Player;
        console.log("data from player data", data);
        setPlayerData(data);
      }
    });

    return unsubscribe;
  }, [sessionId]);

  const ownableIds = playerData?.ownables;

  return (
    <div className="flex flex-col flex-1 bg-orange-400 rounded-lg text-center">
      <h2>Properties</h2>
      {ownableIds &&
        ownableIds.map((ownableId) => (
          <Property ownableId={ownableId} key={ownableId} />
        ))}
    </div>
  );
}

function Property(props: { ownableId: string }) {
  return (
    <div className="flex h-5 w-full bg-amber-800 opacity-50">
      <div className="h-full aspect-9/16 bg-blue-400" />
      <p>{props.ownableId}</p>
    </div>
  );
}
