"use client";
import type { PropertyTile, RailroadTile, UtilityTile } from "@/types/board";
import { useGameData } from "../_lib/data/gameData";
import { Ownable, Player } from "@/types/gameTypes";
import defaultBoard from "@/data/boards/default";
import { sellProperty, mortgageProperty, buyHouse, sellHouse } from "../_lib/server/actions";
import { useParams } from "next/navigation";

type OwnableTile = PropertyTile | RailroadTile | UtilityTile;

interface Props {
  tile: OwnableTile;
  onClose: () => void;
}

export default function TileInfoPanel({ tile, onClose }: Props) {
  const mortgageValue = tile.price / 2;
  const sessionId = useParams().sessionId as string;
  const ownableData = useGameData((state) => state.ownables?.[tile.name]);
  const players = useGameData((state) => state.players);

  // Helper to get owner data if exists
  const ownerData = ownableData?.owner && players ? players[ownableData.owner] : undefined;

  return (
    <div className="fixed right-4 top-4 w-64 bg-white shadow-lg border rounded-md p-3 z-50">
      <Header name={tile.name} onClose={onClose} />

      {tile.subtype === "property" && <PropertyInfo tile={tile} ownableData={ownableData} ownerData={ownerData} />}
      {tile.subtype === "transportation" && <RailroadInfo tile={tile} ownableData={ownableData} ownerData={ownerData} />}
      {tile.subtype === "company" && <UtilityInfo tile={tile} ownableData={ownableData} ownerData={ownerData} />}
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={async () => await sellProperty(sessionId, tile.name)}>
        Sell Property
      </button>
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={async () => await mortgageProperty(sessionId, tile.name)}>
        Mortgage Property
      </button>
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={async () => await buyHouse(sessionId, tile.name)}>
        Buy House
      </button>
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
        onClick={async () => await sellHouse(sessionId, tile.name)}>
        Sell House
      </button>
    </div>
  );
}

function PropertyInfo({ tile, ownableData, ownerData }: { tile: PropertyTile, ownableData?: Ownable, ownerData?: Player }) {
  const currentLevel = ownableData?.owner !== "" ? ownableData?.housesAmount ?? 0 : -1;

  // Custom monopoly check
  let hasMonopoly = false;
  if (ownerData && ownableData) {
    hasMonopoly = ownableData.familyMembers.every(member => ownerData.ownables.includes(member));
  }

  const isMonopolyBase = hasMonopoly && currentLevel === 0;

  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          {tile.rent.map((r, i) => (
            <li key={i} className={(i === currentLevel && !isMonopolyBase) || (i === 0 && isMonopolyBase) ? "font-bold text-green-600" : ""}>
              {i === 0 ? (isMonopolyBase ? `Base (x2): $${r} ($${r * 2})` : `Base: $${r}`) :
                i === 5 ? `Hotel: $${r}` :
                  `${i} house${i === 1 ? "" : "s"}: $${r}`}
            </li>
          ))}
        </ul>
      </div>

      <div><strong>House Cost:</strong> ${tile.houseCost}</div>

      <div>
        <strong>Mortgage Value:</strong> ${tile.price / 2}
      </div>
    </div>
  );
}

function RailroadInfo({ tile, ownableData, ownerData }: { tile: RailroadTile, ownableData?: Ownable, ownerData?: Player }) {
  let ownedCount = 0;
  if (ownerData) {
    ownedCount = ownerData.ownables.filter((name: string) => defaultBoard.find(t => t.name === name)?.subtype === "transportation").length;
  }
  // If nobody owns it, ownedCount is 0, highlight nothing or handled gracefully? 
  // Rent levels are 0-indexed in map (0 => 1 owned, 1 => 2 owned, etc.)
  const activeIndex = ownedCount > 0 ? ownedCount - 1 : -1;

  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          {tile.rent.map((r, i) => (
            <li key={i} className={i === activeIndex ? "font-bold text-green-600" : ""}>
              {i + 1} owned: ${r}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Mortgage Value:</strong> ${tile.price / 2}
      </div>
    </div>
  );
}

function UtilityInfo({ tile, ownableData, ownerData }: { tile: UtilityTile, ownableData?: Ownable, ownerData?: Player }) {
  let ownedCount = 0;
  if (ownerData) {
    ownedCount = ownerData.ownables.filter((name: string) => defaultBoard.find(t => t.name === name)?.subtype === "company").length;
  }

  const activeIndex = ownedCount > 0 ? ownedCount - 1 : -1;

  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          <li className={activeIndex === 0 ? "font-bold text-green-600" : ""}>1 owned: {tile.multiplier[0]}× dice</li>
          <li className={activeIndex === 1 ? "font-bold text-green-600" : ""}>2 owned: {tile.multiplier[1]}× dice</li>
        </ul>
      </div>

      <div>
        <strong>Mortgage Value:</strong> ${tile.price / 2}
      </div>
    </div>
  );
}

function Header({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  return (
    <div className="flex justify-between items-center mb-2">
      <h2 className="font-semibold text-sm text-black">{name}</h2>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-black cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
