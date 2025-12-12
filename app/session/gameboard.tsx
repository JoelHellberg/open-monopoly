import defaultBoard from "@/data/boards";
import React from "react";
import PlayersDisplay from "./playersDisplay";

export default function GameBoard() {
  const board = defaultBoard;
  const streetsPerSide = board.length / 4 + 1;
  console.log("streetsPerSide:", streetsPerSide);

  const top = board.slice(0, streetsPerSide);
  const left = board.slice(streetsPerSide, streetsPerSide * 2 - 2).reverse();
  const bottom = board
    .slice(streetsPerSide * 2 - 2, streetsPerSide * 3 - 2)
    .reverse();
  const right = board.slice(streetsPerSide * 3 - 2, streetsPerSide * 4 - 4);

  return (
    <div className="h-full w-full relative">
      <PlayersDisplay streetsPerSide={streetsPerSide} />
      <div
        className="grid h-full w-full"
        style={{
          gridTemplateColumns: "2fr repeat(9, 1fr) 2fr",
          gridTemplateRows: "2fr repeat(9, 1fr) 2fr",
        }}
      >
        {/* Top */}
        {top.map((street) => (
          <Tile key={street.id} street={street} side="top" />
        ))}

        {/* Middle */}
        {Array.from({ length: 9 }, (_, i) => (
          <React.Fragment key={i}>
            <Tile street={left[i]} side="left" />
            <div className="col-span-9"></div>
            <Tile street={right[i]} side="right" />
          </React.Fragment>
        ))}

        {/* Bottom */}
        {bottom.map((street) => (
          <Tile key={street.id} street={street} side="bottom" />
        ))}
      </div>
    </div>
  );
}

function Tile({
  street,
  side,
}: {
  street: any;
  side: "top" | "right" | "bottom" | "left";
}) {
  // Rotation based on side
  const rotation = {
    top: 180,
    right: 0,
    bottom: 0,
    left: 180,
  }[side];

  // Color strip orientation
  const isProperty = street.type === "property";
  const isHorizontal = side === "top" || side === "bottom";
  const strip = isHorizontal
    ? { className: "w-full h-[20%] bg-blue-400 top-0 left-0" } // horizontal
    : { className: "h-full w-[20%] bg-blue-400 left-0 top-0" }; // vertical

  return (
    <div
      className="relative flex items-center justify-center border bg-white text-[8px] overflow-hidden rounded-sm"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {isProperty && (
        <>
          <div className={`absolute ${strip.className}`} />
          <div
            className={
              "absolute aspect-square rounded-full bg-green-400 " +
              (isHorizontal
                ? "w-1/3 top-0 -translate-y-1/2"
                : "h-2/5 left-0 -translate-x-1/2")
            }
          />
        </>
      )}

      {/* Text counter-rotated so it stays readable */}
      <div
        className="text-center overscroll-contain p-0.5"
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
