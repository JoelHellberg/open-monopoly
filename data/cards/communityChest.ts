import { Card } from "@/types/gameTypes";

export const communityChestCards: Card[] = [
    { id: 1, text: "Advance to Go (Collect $300)", action: "MOVE", target: 0 },
    { id: 2, text: "Bank error in your favor. Collect $200", action: "RECEIVE", value: 200 },
    { id: 3, text: "Doctor's fees. Pay $50", action: "PAY", value: 50 },
    { id: 4, text: "From sale of stock you get $50", action: "RECEIVE", value: 50 },
    { id: 5, text: "Get Out of Jail Free", action: "JAIL_FREE" },
    { id: 6, text: "Go to Jail. Go directly to Jail. Do not pass Go, do not collect $200.", action: "GO_TO_JAIL" },
    { id: 7, text: "Grand Opera Night. Collect $50 from every player for opening night seats", action: "RECEIVE_ALL", value: 50 },
    { id: 8, text: "Holiday Fund matures. Receive $100", action: "RECEIVE", value: 100 },
    { id: 9, text: "Income tax refund. Collect $20", action: "RECEIVE", value: 20 },
    { id: 10, text: "It is your birthday. Collect $10 from every player", action: "RECEIVE_ALL", value: 10 },
    { id: 11, text: "Life insurance matures. Collect $100", action: "RECEIVE", value: 100 },
    { id: 12, text: "Pay hospital fees of $100", action: "PAY", value: 100 },
    { id: 13, text: "Pay school fees of $50", action: "PAY", value: 50 },
    { id: 14, text: "Receive $25 consultancy fee", action: "RECEIVE", value: 25 },
    { id: 15, text: "You are assessed for street repairs. $40 per house. $115 per hotel", action: "PAY", value: 0 }, // Not implemented fully yet
    { id: 16, text: "You have won second prize in a beauty contest. Collect $10", action: "RECEIVE", value: 10 },
    { id: 17, text: "You inherit $100", action: "RECEIVE", value: 100 },
];
