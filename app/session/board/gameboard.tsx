"use client";
import defaultBoard from "@/data/boards/default";
import type { Tile as BoardTile } from "@/types/board";
import { propertyColors } from "@/data/colors";
import React, { useState } from "react";
import PlayersDisplay from "./players/playersDisplay";
import { useGameData } from "../_lib/data/gameData";
import TileInfoPanel from "./tileInfoPanel";
import type { PropertyTile, RailroadTile, UtilityTile, } from "@/types/board";

type OwnableTile = PropertyTile | RailroadTile | UtilityTile;

export default function GameBoard() {
  const board = defaultBoard;
  const [selectedTile, setSelectedTile] = useState<OwnableTile | null>(null);

  const sPS = board.length / 4 + 1; // Streets Per Side
  const sBC = sPS - 2; // Streets Between Corners
  console.log("streetsPerSide:", sPS);

  const top = board.slice(0, sPS);
  const right = board.slice(sPS, sPS + sBC);
  const bottom = board.slice(sPS + sBC, sPS * 2 + sBC).reverse();
  const left = board.slice(sPS * 2 + sBC, sPS * 2 + sBC * 2).reverse();

  return (
    <div className="h-full w-full relative select-none">
      {selectedTile && (
        <TileInfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)}/>
      )}
      <PlayersDisplay streetsPerSide={sPS} streetsBetweenCorners={sBC} />
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: "2fr repeat(9, 1fr) 2fr",
          gridTemplateRows: "2fr repeat(9, 1fr) 2fr",
        }}
      >
        {/* Top */}
        {top.map((street) => (
          <Tile key={street.id} street={street} side="top" onSelect={setSelectedTile}/>
        ))}

        {/* Middle */}
        {Array.from({ length: 9 }, (_, i) => (
          <React.Fragment key={i}>
            <Tile street={left[i]} side="left" onSelect={setSelectedTile}/>
            <div className="col-span-9"></div>
            <Tile street={right[i]} side="right" onSelect={setSelectedTile}/>
          </React.Fragment>
        ))}

        {/* Bottom */}
        {bottom.map((street) => (
          <Tile key={street.id} street={street} side="bottom" onSelect={setSelectedTile}/>
        ))}
      </div>
    </div>
  );
}

function Tile({
  street,
  side,
  onSelect,
}: {
  street: BoardTile;
  side: "top" | "right" | "bottom" | "left";
   onSelect?: (tile: OwnableTile) => void;
}) {
  // Rotation based on side
  const rotation = {
    top: 180,
    right: 0,
    bottom: 0,
    left: 180,
  }[side];
  const ownableData = useGameData(
    (state) => state.ownables?.[street.name] ?? null
  );
  const isOwnableTile = (
    tile: BoardTile
  ): tile is OwnableTile =>
    tile.type === "ownable";

  // Color strip orientation
  const isOwnable = street.type === "ownable";
  const isStreet = street.subtype === "property";
  const colorClass =
    street.subtype === "property" ? propertyColors[street.color] : "";
  const isHorizontal = side === "top" || side === "bottom";
  const strip = isHorizontal
    ? { className: "w-full h-[20%] top-0 left-0" } // horizontal
    : { className: "h-full w-[20%] left-0 top-0" }; // vertical

  return (
    <div
      className={`relative flex items-center justify-center border bg-white text-[8px] overflow-hidden rounded-sm
        ${isOwnable ? "hover:bg-gray-100 hover:cursor-pointer" : ""}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={() => {
        if (isOwnableTile(street)) {
          console.log("Selected tile:", street.name);
          onSelect?.(street);
        }
      }}
    >
      {isOwnable && (
        <>
          {isStreet && (
            <div
              className={`absolute flex items-center justify-center text-center ${strip.className} ${colorClass}`}
            >
              {ownableData && ownableData.housesAmount > 0 && (
                <p
                  className="font-bold z-50"
                  style={{
                    whiteSpace: "normal",
                    writingMode: `${
                      isHorizontal ? "horizontal-tb" : "vertical-rl"
                    }`,
                    transform: `rotate(${isHorizontal ? -rotation : -180}deg)`,
                    textOrientation: "mixed",
                  }}
                >
                  x{ownableData?.housesAmount}
                </p>
              )}
            </div>
          )}
          {ownableData && ownableData.owner != "" && (
            <div
              className={
                "absolute aspect-square rounded-full " +
                (isHorizontal
                  ? "w-1/3 top-0 -translate-y-1/2"
                  : "h-2/5 left-0 -translate-x-1/2")
              }
              style={{ backgroundColor: `#${"00FF00"}` }}
            />
          )}
        </>
      )}

      {/* Text counter-rotated so it stays readable */}
      <div
        className="text-center text-black overscroll-contain p-0.5"
        style={{
          whiteSpace: "normal",
          writingMode: `${isHorizontal ? "horizontal-tb" : "vertical-rl"}`,
          transform: `rotate(${isHorizontal ? -rotation : -180}deg)`,
          textOrientation: "mixed",
        }}
      >
        {street.name}
      </div>
    </div>
  );
}
