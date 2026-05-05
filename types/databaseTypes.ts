export type AuctionInfoRTDB = {
  tile: string;
  currentBid: number;
  highestBidderId: string;
  participants: string[];  endTime: number;};

export type GameSettingsRTDB = {
  startingMoney: number;
  selectedBoard: "default";
  freeParkingMoney: boolean;
  allowHouseShortage: boolean;
};

export type GameDataRTDB = {
  diceOne: number;
  diceTwo: number;
  host: string;
  currentPlayer: number;
  playersInSession?: Record<string, true>;
  gameIsOn: boolean;
  settings?: GameSettingsRTDB;
  gameChatMessages?: Record<string, {
    messageContent: string;
    playerId: string;
    timeStamp: number;
  }>;
  trades?: Record<string, {
    offeringPlayer: string;
    receivingPlayer: string;
    offeringProperties: string[];
    receivingProperties: string[];
    offeringMoney: number;
    receivingMoney: number;
    offeringFreeRent: string[];
    receivingFreeRent: string[];
    offeringSharedIncome: [string, number][];
    receivingSharedIncome: [string, number][];
  }>;

  auction?: AuctionInfoRTDB;
};