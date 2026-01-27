"use client";
import type { PropertyTile, RailroadTile, UtilityTile, Tile, } from "@/types/board";

type OwnableTile = PropertyTile | RailroadTile | UtilityTile;

interface Props {
  tile: OwnableTile;
  onClose: () => void;
}

export default function TileInfoPanel({ tile, onClose }: Props) {
  const mortgageValue = tile.price / 2;

  return (
    <div className="fixed right-4 top-4 w-64 bg-white shadow-lg border rounded-md p-3 z-50">
      <Header name={tile.name} onClose={onClose} />

      {tile.subtype === "property" && <PropertyInfo tile={tile} />}
      {tile.subtype === "transportation" && <RailroadInfo tile={tile} />}
      {tile.subtype === "company" && <UtilityInfo tile={tile} />}
    </div>
  );
}

function PropertyInfo({ tile }: { tile: PropertyTile }) {
  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          {tile.rent.map((r, i) => (
            <li key={i}>
              {i === 0 ? "Base" : i === 5 ? "Hotel" : `${i} house${i === 1 ? "" : "s"}`}: ${r}
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

function RailroadInfo({ tile }: { tile: RailroadTile }) {
  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          {tile.rent.map((r, i) => (
            <li key={i}>
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

function UtilityInfo({ tile }: { tile: UtilityTile }) {
  return (
    <div className="text-xs space-y-2 text-black">
      <div><strong>Buy Cost:</strong> ${tile.price}</div>

      <div>
        <strong>Rent:</strong>
        <ul className="ml-3 mt-1 space-y-0.5">
          <li>1 owned: {tile.multiplier[0]}× dice</li>
          <li>2 owned: {tile.multiplier[1]}× dice</li>
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
