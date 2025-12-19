import { useGameData } from "./_lib/data/gameData";

export default function PropertiesDisplay() {
  const ownPlayerId: string = useGameData((state) => state.ownPlayerId);
  const playerData = useGameData(
    (state) => state.players?.[ownPlayerId] ?? null
  );

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
