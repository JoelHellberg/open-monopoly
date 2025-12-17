import { Timestamp } from "firebase/firestore";

export type GameData = {
  diceOne: number;
  diceTwo: number;
  host: string;
  currentPlayer: number;
  playersInSession: string[];
  gameIsOn: boolean;
};

export type Player = {
  money: number;
  ownables: string[];
  pos: number;
  status: string;
  color: string;
};

export type Ownable = {
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
