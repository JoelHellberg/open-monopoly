import { Tile } from "@/types/board";
import { defaultBoard, allownableBoard } from "./default";

export type BoardType = "default" | "allownable";

export const boards: Record<BoardType, Tile[]> = {
  default: defaultBoard,
  allownable: allownableBoard,
};

export function getBoard(boardType: BoardType): Tile[] {
  return boards[boardType] || defaultBoard;
}

export const boardOptions: { value: BoardType; label: string; description: string }[] = [
  {
    value: "default",
    label: "Standard Monopoly Board",
    description: "Classic Monopoly board with all events, taxes, and chance cards"
  },
  {
    value: "allownable",
    label: "All-Ownable Board",
    description: "All properties are ownable, no event tiles like taxes or community chest"
  }
];