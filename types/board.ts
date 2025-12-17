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
  subtype: string;
}

export interface PropertyTile extends BaseTile {
  type: "ownable";
  subtype: "street";
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
  type: "ownable";
  subtype: "transportation";
  price: number;
  rent: number[]; // indexed by owned railroads
}

export interface UtilityTile extends BaseTile {
  type: "ownable";
  subtype: "company";
  price: number;
  multiplier: number[]; // dice multiplier
}

export interface EventTile extends BaseTile {
  type: "event";
}

export interface CornerTile extends EventTile {
  subtype: "go" | "jail" | "parking" | "toJail";
}

export interface TaxTile extends EventTile {
  subtype: "tax";
  amount: number;
}

export interface ChanceTile extends EventTile {
  subtype: "chance";
}

export interface ChestTile extends EventTile {
  subtype: "chest";
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
