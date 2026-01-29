import { Timestamp } from "firebase/firestore";

export type GameData = {
  diceOne: number;
  diceTwo: number;
  host: string;
  currentPlayer: number;
  playersInSession: string[];
  gameIsOn: boolean;
};

export type Players = Record<string, Player>;
export type Player = {
  id: string;
  money: number;
  ownables: string[];
  pos: number;
  status: string;
  color: string;
  doublesInRow: number;
  jailFreeCards: number;
};

export type Ownables = Record<string, Ownable>;
export type Ownable = {
  id: string;
  type: string;
  familyMembers: string[];
  housesAmount: number;
  owner: string;
  mortgaged: boolean;
  price: number;
  houseCost: number;
  rent: number[];
};

export type GameMessage = {
  messageContent: string;
  playerId: string;
  timeStamp: Timestamp;
};

export type Card = {
  id: number;
  text: string;
  action: "MOVE" | "PAY" | "RECEIVE" | "JAIL_FREE" | "GO_TO_JAIL" | "MOVEREL" | "PAY_ALL" | "RECEIVE_ALL";
  value?: number; // Amount or relative movement
  target?: number; // Target tile ID (for MOVE)
  subaction?: string; // For "nearest utility/railroad"
};
