import { Card } from "@/types/gameTypes";

export const chanceCards: Card[] = [
    { id: 1, text: "Advance to Go (Collect $300)", action: "MOVE", target: 0 },
    { id: 2, text: "Advance to Illinois Ave.", action: "MOVE", target: 24 },
    { id: 3, text: "Advance to St. Charles Place. If you pass Go, collect $200", action: "MOVE", target: 11 },
    { id: 4, text: "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.", action: "MOVE", subaction: "nearest_utility" },
    { id: 5, text: "Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.", action: "MOVE", subaction: "nearest_railroad" },
    { id: 6, text: "Bank pays you dividend of $50", action: "RECEIVE", value: 50 },
    { id: 7, text: "Get out of Jail Free", action: "JAIL_FREE" },
    { id: 8, text: "Go Back 3 Spaces", action: "MOVEREL", value: -3 },
    { id: 9, text: "Go to Jail. Go directly to Jail. Do not pass Go, do not collect $200.", action: "GO_TO_JAIL" },
    { id: 10, text: "Make general repairs on all your property. For each house pay $25. For each hotel $100.", action: "PAY", value: 0 }, // Not implemented fully yet
    { id: 11, text: "Pay poor tax of $15", action: "PAY", value: 15 },
    { id: 12, text: "Take a trip to Reading Railroad. If you pass Go, collect $200", action: "MOVE", target: 5 },
    { id: 13, text: "Take a walk on the Boardwalk. Advance token to Boardwalk", action: "MOVE", target: 39 },
    { id: 14, text: "Elected Chairman of the Board. Pay each player $50", action: "PAY_ALL", value: 50 },
    { id: 15, text: "Your building loan matures. Collect $150", action: "RECEIVE", value: 150 },
];
