export type Tile =
  | CornerTile
  | PropertyTile
  | RailroadTile
  | UtilityTile
  | TaxTile
  | ChanceTile
  | ChestTile;

export interface BaseTile {
  id: number;
  name: string;
  type: string;
}

export interface PropertyTile extends BaseTile {
  type: "property";
  color: PropertyColor;
  price: number;
  houseCost: number;
  rent: [
    number, // 0 houses
    number, // 1 house
    number, // 2 houses
    number, // 3 houses
    number, // 4 houses
    number  // hotel
  ];
}

export interface RailroadTile extends BaseTile {
  type: "railroad";
  price: number;
  rent: number[]; // indexed by owned railroads
}

export interface UtilityTile extends BaseTile {
  type: "utility";
  price: number;
  multiplier: number[]; // dice multiplier
}

export interface CornerTile extends BaseTile {
  type: "corner";
}

export interface TaxTile extends BaseTile {
  type: "tax";
  amount: number;
}

export interface ChanceTile extends BaseTile {
  type: "chance";
}

export interface ChestTile extends BaseTile {
  type: "chest";
}

export type PropertyColor =
  | "brown"
  | "light-blue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "dark-blue";
