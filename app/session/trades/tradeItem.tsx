import { Trade } from "@/types/gameTypes";
import { useGameData } from "../_lib/data/gameData";

export default function TradeItem({ trade, tradeId, onClick }: { trade: Trade, tradeId: string, onClick: () => void }) {
    const players = useGameData((state) => state.players);

    return (
        <button
            onClick={onClick}
            className="flex flex-col w-full h-fit rounded-lg p-2 bg-white hover:bg-gray-100 transition-colors shadow-sm text-left border border-gray-200 hover:cursor-pointer"
        >
            <div className="text-sm font-bold text-gray-800">
                <span className="text-blue-600">{players?.[trade.offeringPlayer]?.name}</span>
                <span className="text-gray-500 mx-1">↔</span>
                <span className="text-orange-600">{players?.[trade.receivingPlayer]?.name}</span>
            </div>
        </button>
    );
}
