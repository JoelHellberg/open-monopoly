export type GameDataRTDB = {
  diceOne: number;
  diceTwo: number;
  host: string;
  currentPlayer: number;
  playersInSession?: Record<string, true>;
  gameIsOn: boolean;
};