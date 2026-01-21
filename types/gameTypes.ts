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
};

export type Ownables = Record<string, Ownable>;
export type Ownable = {
  id: string;
  type: string;
  familyMembers: string[];
  housesAmount: number;
  owner: string;
  cost: number;
  rent: number[];
};

export type GameMessage = {
  messageContent: string;
  playerId: string;
  timeStamp: Timestamp;
};
