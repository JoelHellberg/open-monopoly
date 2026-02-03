"use client";

import { useState } from "react";
import CreateTradePanel from "./createTradePanel";
import AcceptTradePanel from "./acceptTradePanel";
import TradeItem from "./tradeItem";
import { useGameData } from "../_lib/data/gameData";
import { Trade } from "@/types/gameTypes";

export default function TradesDisplay() {
    const [isCreatingTrade, setIsCreatingTrade] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState<{ id: string, trade: Trade } | null>(null);
    const trades = useGameData((state) => state.data?.trades);

    return (
        <div className="flex flex-col bg-yellow-400 items-center w-full pt-5 rounded-lg">
            <button
                onClick={() => setIsCreatingTrade(true)}
                className="text-sm rounded-md shadow-md 
                text-black bg-white hover:bg-gray-200 hover:cursor-pointer px-4 py-2">
                Create Trade
            </button>
            <div className="flex flex-col flex-1 w-full overflow-y-auto gap-2 p-2 bg-blue-900 mt-4 rounded-b-lg min-h-[100px]">
                {trades && Object.entries(trades).map(([id, trade]) => (
                    <TradeItem
                        key={id}
                        trade={trade}
                        tradeId={id}
                        onClick={() => setSelectedTrade({ id: id, trade: trade })}
                    />
                ))}
            </div>

            {isCreatingTrade && (
                <CreateTradePanel onClose={() => setIsCreatingTrade(false)} />
            )}

            {selectedTrade && (
                <AcceptTradePanel
                    trade={selectedTrade.trade}
                    tradeId={selectedTrade.id}
                    onClose={() => setSelectedTrade(null)}
                />
            )}
        </div>
    );
}