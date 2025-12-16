import { Tile } from "@/types/board";

export const defaultBoard: Tile[] = [
  { id: 1, name: "Go", type: "corner" },

  { id: 2, name: "Mediterranean Avenue", type: "property", color: "brown",
    price: 60, houseCost: 50, rent: [2, 10, 30, 90, 160, 250], },

  { id: 3, name: "Community Chest", type: "chest" },

  { id: 4, name: "Baltic Avenue", type: "property", color: "brown",
    price: 60, houseCost: 50, rent: [4, 20, 60, 180, 320, 450], },

  { id: 5, name: "Income Tax", type: "tax", amount: 200 },

  { id: 6, name: "Reading Railroad", type: "railroad",
    price: 200, rent: [25, 50, 100, 200], },

  { id: 7, name: "Oriental Avenue", type: "property", color: "light-blue",
    price: 100, houseCost: 50, rent: [6, 30, 90, 270, 400, 550], },

  { id: 8, name: "Chance", type: "chance" },

  { id: 9, name: "Vermont Avenue", type: "property", color: "light-blue",
    price: 100, houseCost: 50, rent: [6, 30, 90, 270, 400, 550], },

  { id: 10, name: "Connecticut Avenue", type: "property", color: "light-blue",
    price: 120, houseCost: 50, rent: [8, 40, 100, 300, 450, 600], },

  { id: 11, name: "Jail / Just Visiting", type: "corner" },

  { id: 12, name: "St. Charles Place", type: "property", color: "pink",
    price: 140, houseCost: 100, rent: [10, 50, 150, 450, 625, 750], },

  { id: 13, name: "Electric Company", type: "utility",
    price: 150, multiplier: [4, 10], },

  { id: 14, name: "States Avenue", type: "property", color: "pink",
    price: 140, houseCost: 100, rent: [10, 50, 150, 450, 625, 750], },

  { id: 15, name: "Virginia Avenue", type: "property", color: "pink",
    price: 160, houseCost: 100, rent: [12, 60, 180, 500, 700, 900], },

  { id: 16, name: "Pennsylvania Railroad", type: "railroad",
    price: 200, rent: [25, 50, 100, 200], },

  { id: 17, name: "St. James Place", type: "property", color: "orange",
    price: 180, houseCost: 100, rent: [14, 70, 200, 550, 750, 950], },

  { id: 18, name: "Community Chest", type: "chest" },

  { id: 19, name: "Tennessee Avenue", type: "property", color: "orange",
    price: 180, houseCost: 100, rent: [14, 70, 200, 550, 750, 950], },

  { id: 20, name: "New York Avenue", type: "property", color: "orange",
    price: 200, houseCost: 100, rent: [16, 80, 220, 600, 800, 1000], },

  { id: 21, name: "Free Parking", type: "corner" },

  { id: 22, name: "Kentucky Avenue", type: "property", color: "red",
    price: 220, houseCost: 150, rent: [18, 90, 250, 700, 875, 1050], },

  { id: 23, name: "Chance", type: "chance" },

  { id: 24, name: "Indiana Avenue", type: "property", color: "red",
    price: 220, houseCost: 150, rent: [18, 90, 250, 700, 875, 1050], },

  { id: 25, name: "Illinois Avenue", type: "property", color: "red",
    price: 240, houseCost: 150, rent: [20, 100, 300, 750, 925, 1100], },

  { id: 26, name: "B. & O. Railroad", type: "railroad",
    price: 200, rent: [25, 50, 100, 200], },

  { id: 27, name: "Atlantic Avenue", type: "property", color: "yellow",
    price: 260, houseCost: 150, rent: [22, 110, 330, 800, 975, 1150], },

  { id: 28, name: "Ventnor Avenue", type: "property", color: "yellow",
    price: 260, houseCost: 150, rent: [22, 110, 330, 800, 975, 1150], },

  { id: 29, name: "Water Works", type: "utility",
    price: 150, multiplier: [4, 10], },

  { id: 30, name: "Marvin Gardens", type: "property", color: "yellow",
    price: 280, houseCost: 150, rent: [24, 120, 360, 850, 1025, 1200], },

  { id: 31, name: "Go To Jail", type: "corner" },

  { id: 32, name: "Pacific Avenue", type: "property", color: "green",
    price: 300, houseCost: 200, rent: [26, 130, 390, 900, 1100, 1275], },

  { id: 33, name: "North Carolina Avenue", type: "property", color: "green",
    price: 300, houseCost: 200, rent: [26, 130, 390, 900, 1100, 1275], },

  { id: 34, name: "Community Chest", type: "chest" },

  { id: 35, name: "Pennsylvania Avenue", type: "property", color: "green",
    price: 320, houseCost: 200, rent: [28, 150, 450, 1000, 1200, 1400], },

  { id: 36, name: "Short Line", type: "railroad",
    price: 200, rent: [25, 50, 100, 200], },

  { id: 37, name: "Chance", type: "chance" },

  { id: 38, name: "Park Place", type: "property", color: "dark-blue",
    price: 350, houseCost: 200, rent: [35, 175, 500, 1100, 1300, 1500], },

  { id: 39, name: "Luxury Tax", type: "tax", amount: 100 },

  { id: 40, name: "Boardwalk", type: "property", color: "dark-blue",
    price: 400, houseCost: 200, rent: [50, 200, 600, 1400, 1700, 2000], },
];

export default defaultBoard;
