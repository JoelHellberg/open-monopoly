"use client";

import { useGameData } from "../_lib/data/gameData";
import { Trade } from "@/types/gameTypes";
import { acceptTrade, cancelTrade } from "../_lib/server/actions";
import { useParams } from "next/navigation";
import { useState } from "react";

interface Props {
    trade: Trade;
    tradeId: string;
    onClose: () => void;
}

export default function AcceptTradePanel({ trade, tradeId, onClose }: Props) {
    const sessionId = useParams().sessionId as string;
    const players = useGameData((state) => state.players);
    const ownPlayerId = useGameData((state) => state.ownPlayerId);

    const [isProcessing, setIsProcessing] = useState(false);

    if (!players || !ownPlayerId) return null;

    const offeringPlayer = players[trade.offeringPlayer];
    const receivingPlayer = players[trade.receivingPlayer];

    const isReceiving = ownPlayerId === trade.receivingPlayer;
    const isOffering = ownPlayerId === trade.offeringPlayer;

    const handleAccept = async () => {
        setIsProcessing(true);
        try {
            await acceptTrade(sessionId, tradeId);
            onClose();
        } catch (error) {
            console.error("Error accepting trade:", error);
            alert("Failed to accept trade. " + (error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        setIsProcessing(true);
        try {
            await cancelTrade(sessionId, tradeId);
            onClose();
        } catch (error) {
            console.error("Error canceling trade:", error);
            alert("Failed to cancel trade. " + (error as Error).message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold italic tracking-wider">TRADE OFFER</h2>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Trade Content */}
                <div className="flex-1 overflow-y-auto p-4 flex gap-4 md:flex-row flex-col">
                    {/* Offering Side */}
                    <div className="flex-1 bg-green-50 rounded-lg border-2 border-green-200 p-4 flex flex-col">
                        <h3 className="font-bold text-green-800 border-b border-green-200 pb-2 mb-4">
                            {offeringPlayer?.name || "Unknown"} OFFERS:
                        </h3>

                        {trade.offeringMoney > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-green-700 mb-1">CASH ($)</label>
                                <div className="text-lg font-bold text-green-900">${trade.offeringMoney}</div>
                            </div>
                        )}

                        {(trade.offeringProperties?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-green-700 mb-1">PROPERTIES</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.offeringProperties.map((propName) => (
                                        <div key={propName} className="p-2 rounded bg-green-600 text-white text-xs font-bold">
                                            {propName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(trade.offeringFreeRent?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-green-700 mb-1">FREE RENT</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.offeringFreeRent.map((propName) => (
                                        <div key={propName} className="p-2 rounded bg-green-500 text-white text-xs font-bold">
                                            {propName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(trade.offeringSharedIncome?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-green-700 mb-1">SHARED INCOME</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.offeringSharedIncome.map(([propName, percent]) => (
                                        <div key={propName} className="p-2 rounded bg-green-400 text-white text-xs font-bold flex justify-between">
                                            <span>{propName}</span>
                                            <span>{percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {trade.offeringMoney === 0 && (!trade.offeringProperties || trade.offeringProperties.length === 0) && (!trade.offeringFreeRent || trade.offeringFreeRent.length === 0) && (!trade.offeringSharedIncome || trade.offeringSharedIncome.length === 0) && (
                            <div className="text-sm text-gray-400 italic">Nothing offered</div>
                        )}
                    </div>

                    {/* Icon/Divider */}
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 md:rotate-90">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </div>
                    </div>

                    {/* Receiving Side */}
                    <div className="flex-1 bg-orange-50 rounded-lg border-2 border-orange-200 p-4 flex flex-col">
                        <h3 className="font-bold text-orange-800 border-b border-orange-200 pb-2 mb-4">
                            {receivingPlayer?.name || "Unknown"} GIVES:
                        </h3>

                        {trade.receivingMoney > 0 && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-orange-700 mb-1">CASH ($)</label>
                                <div className="text-lg font-bold text-orange-900">${trade.receivingMoney}</div>
                            </div>
                        )}

                        {(trade.receivingProperties?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-orange-700 mb-1">PROPERTIES</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.receivingProperties.map((propName) => (
                                        <div key={propName} className="p-2 rounded bg-orange-600 text-white text-xs font-bold">
                                            {propName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(trade.receivingFreeRent?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-orange-700 mb-1">FREE RENT</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.receivingFreeRent.map((propName) => (
                                        <div key={propName} className="p-2 rounded bg-orange-500 text-white text-xs font-bold">
                                            {propName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(trade.receivingSharedIncome?.length > 0) && (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-orange-700 mb-1">SHARED INCOME</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {trade.receivingSharedIncome.map(([propName, percent]) => (
                                        <div key={propName} className="p-2 rounded bg-orange-400 text-white text-xs font-bold flex justify-between">
                                            <span>{propName}</span>
                                            <span>{percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {trade.receivingMoney === 0 && (!trade.receivingProperties || trade.receivingProperties.length === 0) && (!trade.receivingFreeRent || trade.receivingFreeRent.length === 0) && (!trade.receivingSharedIncome || trade.receivingSharedIncome.length === 0) && (
                            <div className="text-sm text-gray-400 italic">Nothing requested</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        disabled={isProcessing}
                    >
                        CLOSE
                    </button>

                    {(isOffering || isReceiving) && (
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing}
                            className="px-6 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all disabled:opacity-50"
                        >
                            {isProcessing ? "PROCESSING..." : (isOffering ? "CANCEL TRADE" : "DENY TRADE")}
                        </button>
                    )}

                    {isReceiving && (
                        <button
                            onClick={handleAccept}
                            disabled={isProcessing}
                            className="px-8 py-2 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isProcessing ? "PROCESSING..." : "ACCEPT TRADE"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
