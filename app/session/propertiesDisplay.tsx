"use client";
import { useGameData } from "./_lib/data/gameData";
import defaultBoard from "@/data/boards/default";
import type { Tile, PropertyTile, RailroadTile, UtilityTile, } from "@/types/board";
import { propertyColors } from "@/data/colors";

export default function PropertiesDisplay() {
  const ownPlayerId: string = useGameData((state) => state.ownPlayerId);
  const playerData = useGameData(
    (state) => state.players?.[ownPlayerId] ?? null
  );
  const ownedNames = new Set(playerData?.ownables ?? []);

  const ownedTiles = defaultBoard.filter(
    (tile): tile is PropertyTile | RailroadTile | UtilityTile =>
      tile.type === "ownable" && ownedNames.has(tile.name)
  );
  const properties = ownedTiles.filter(
    (t): t is PropertyTile => t.subtype === "property"
  );
  const railroads = ownedTiles.filter(
    (t): t is RailroadTile => t.subtype === "transportation"
  );
  const utilities = ownedTiles.filter(
    (t): t is UtilityTile => t.subtype === "company"
  );

  const orderedOwnedTiles = [
    ...properties,
    ...railroads,
    ...utilities,
  ];

  return (
    <div className="flex flex-col flex-1 bg-orange-400 rounded-lg text-center">
      <h2>Properties</h2>

      {orderedOwnedTiles.map((tile) => (
        <OwnedTile key={tile.name} tile={tile} />
      ))}
    </div>

  );
}

function OwnedTile({ tile, }: { tile: PropertyTile | RailroadTile | UtilityTile; }) {
  let badgeColor = "bg-gray-400";
  if (tile.subtype === "property") {
    badgeColor = propertyColors[tile.color];
  } else if (tile.subtype === "transportation") {
    badgeColor = "bg-black";
  } else if (tile.subtype === "company") {
    badgeColor = "bg-black";
  }

  return (
    <div className="flex items-center h-5 w-full bg-amber-800 opacity-80 text-xs text-white">
      <div className={`h-full aspect-[9/16] ${badgeColor}`} />
      <p className="ml-2 truncate">{tile.name}</p>
    </div>
  );
}

