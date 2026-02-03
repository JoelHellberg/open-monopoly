"use client";

import { useState } from "react";
import { useGameData } from "../_lib/data/gameData";
import { Trade, Player } from "@/types/gameTypes";
import { createTrade } from "../_lib/server/actions";
import { useParams } from "next/navigation";

interface Props {
    onClose: () => void;
}

export default function CreateTradePanel({ onClose }: Props) {
    const sessionId = useParams().sessionId as string;
    const players = useGameData((state) => state.players);
    const ownPlayerId = useGameData((state) => state.ownPlayerId);
    const ownables = useGameData((state) => state.ownables);

    const [receivingPlayerId, setReceivingPlayerId] = useState<string>("");
    const [offeringMoney, setOfferingMoney] = useState<number>(0);
    const [receivingMoney, setReceivingMoney] = useState<number>(0);
    const [offeringProperties, setOfferingProperties] = useState<string[]>([]);
    const [receivingProperties, setReceivingProperties] = useState<string[]>([]);
    const [offeringFreeRent, setOfferingFreeRent] = useState<string[]>([]);
    const [receivingFreeRent, setReceivingFreeRent] = useState<string[]>([]);
    const [offeringSharedIncome, setOfferingSharedIncome] = useState<[string, number][]>([]);
    const [receivingSharedIncome, setReceivingSharedIncome] = useState<[string, number][]>([]);

    const [offerSections, setOfferSections] = useState({ props: false, rent: false, income: false });
    const [receiveSections, setReceiveSections] = useState({ props: false, rent: false, income: false });

    if (!players || !ownPlayerId || !players[ownPlayerId]) return null;

    const ownPlayer = players[ownPlayerId];
    const opponents = Object.values(players).filter((p) => p.id !== ownPlayerId && p.status !== "OUT");
    const receivingPlayer = receivingPlayerId ? players[receivingPlayerId] : null;

    const handleSubmit = async () => {
        if (!receivingPlayerId) return;

        const trade: Trade = {
            offeringPlayer: ownPlayerId,
            receivingPlayer: receivingPlayerId,
            offeringProperties,
            receivingProperties,
            offeringMoney,
            receivingMoney,
            offeringFreeRent,
            receivingFreeRent,
            offeringSharedIncome,
            receivingSharedIncome,
        };

        await createTrade(sessionId, trade);
        onClose();
    };

    const toggleProperty = (property: string, side: "offer" | "receive") => {
        if (side === "offer") {
            setOfferingProperties((prev) =>
                prev.includes(property) ? prev.filter((p) => p !== property) : [...prev, property]
            );
        } else {
            setReceivingProperties((prev) =>
                prev.includes(property) ? prev.filter((p) => p !== property) : [...prev, property]
            );
        }
    };

    const toggleFreeRent = (property: string, side: "offer" | "receive") => {
        if (side === "offer") {
            setOfferingFreeRent((prev) =>
                prev.includes(property) ? prev.filter((p) => p !== property) : [...prev, property]
            );
        } else {
            setReceivingFreeRent((prev) =>
                prev.includes(property) ? prev.filter((p) => p !== property) : [...prev, property]
            );
        }
    };

    const toggleSharedIncome = (property: string, side: "offer" | "receive") => {
        if (side === "offer") {
            setOfferingSharedIncome((prev) =>
                prev.some(item => item[0] === property)
                    ? prev.filter((p) => p[0] !== property)
                    : [...prev, [property, 50]]
            );
        } else {
            setReceivingSharedIncome((prev) =>
                prev.some(item => item[0] === property)
                    ? prev.filter((p) => p[0] !== property)
                    : [...prev, [property, 50]]
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold italic tracking-wider">CREATE TRADE</h2>
                    <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Opponent Selection */}
                <div className="p-4 border-b bg-gray-50">
                    <label className="block text-sm font-bold text-gray-700 mb-2">SELECT OPPONENT</label>
                    <select
                        value={receivingPlayerId}
                        onChange={(e) => {
                            setReceivingPlayerId(e.target.value);
                            setReceivingProperties([]);
                            setReceivingMoney(0);
                        }}
                        className="w-full p-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 text-black transition-colors"
                    >
                        <option value="">Choose a player...</option>
                        {opponents.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Trade Content */}
                <div className="flex-1 overflow-y-auto p-4 flex gap-4 md:flex-row flex-col">
                    {/* My Offer */}
                    <div className="flex-1 bg-green-50 rounded-lg border-2 border-green-200 p-4 flex flex-col">
                        <h3 className="font-bold text-green-800 border-b border-green-200 pb-2 mb-4">YOUR OFFER</h3>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-green-700 mb-1">CASH OFFER ($)</label>
                            <input
                                type="number"
                                min="0"
                                max={ownPlayer.money}
                                value={offeringMoney}
                                onChange={(e) => setOfferingMoney(Math.min(ownPlayer.money, Math.max(0, parseInt(e.target.value) || 0)))}
                                className="w-full p-2 border rounded text-black"
                            />
                            <p className="text-[10px] text-green-600 mt-1">Available: ${ownPlayer.money}</p>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={() => setOfferSections(prev => ({ ...prev, props: !prev.props }))}
                                className="w-full flex justify-between items-center text-xs font-bold text-green-700 mb-2 border-b border-green-100 pb-1"
                            >
                                <span>PROPERTIES ({offeringProperties.length})</span>
                                <span>{offerSections.props ? "▲" : "▼"}</span>
                            </button>
                            {offerSections.props && (
                                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                    {ownPlayer.ownables?.map((propName) => (
                                        <PropertyItem
                                            key={propName}
                                            name={propName}
                                            selected={offeringProperties.includes(propName)}
                                            onClick={() => toggleProperty(propName, "offer")}
                                            color={ownables?.[propName]?.mortgaged ? "gray" : "green"}
                                        />
                                    ))}
                                    {(!ownPlayer.ownables || ownPlayer.ownables.length === 0) && (
                                        <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={() => setOfferSections(prev => ({ ...prev, rent: !prev.rent }))}
                                className="w-full flex justify-between items-center text-xs font-bold text-green-700 mb-2 border-b border-green-100 pb-1"
                            >
                                <span>FREE RENT ({offeringFreeRent.length})</span>
                                <span>{offerSections.rent ? "▲" : "▼"}</span>
                            </button>
                            {offerSections.rent && (
                                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                    {ownPlayer.ownables?.map((propName) => (
                                        <PropertyItem
                                            key={propName}
                                            name={propName}
                                            selected={offeringFreeRent.includes(propName)}
                                            onClick={() => toggleFreeRent(propName, "offer")}
                                            color={ownables?.[propName]?.mortgaged ? "gray" : "green"}
                                        />
                                    ))}
                                    {(!ownPlayer.ownables || ownPlayer.ownables.length === 0) && (
                                        <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mb-2">
                            <button
                                onClick={() => setOfferSections(prev => ({ ...prev, income: !prev.income }))}
                                className="w-full flex justify-between items-center text-xs font-bold text-green-700 mb-2 border-b border-green-100 pb-1"
                            >
                                <span>SHARED INCOME ({offeringSharedIncome.length})</span>
                                <span>{offerSections.income ? "▲" : "▼"}</span>
                            </button>
                            {offerSections.income && (
                                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                    {ownPlayer.ownables?.map((propName) => (
                                        <PropertyItem
                                            key={propName}
                                            name={propName}
                                            selected={offeringSharedIncome.some((item) => item[0] === propName)}
                                            onClick={() => toggleSharedIncome(propName, "offer")}
                                            color={ownables?.[propName]?.mortgaged ? "gray" : "green"}
                                        />
                                    ))}
                                    {(!ownPlayer.ownables || ownPlayer.ownables.length === 0) && (
                                        <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Icon/Divider */}
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 md:rotate-90">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                        </div>
                    </div>

                    {/* Their Request */}
                    <div className={`flex-1 ${receivingPlayer ? 'bg-orange-50 border-orange-200' : 'bg-gray-100 border-gray-200 grayscale'} rounded-lg border-2 p-4 flex flex-col transition-all overflow-hidden`}>
                        <h3 className={`font-bold ${receivingPlayer ? 'text-orange-800 border-orange-200' : 'text-gray-500 border-gray-200'} border-b pb-2 mb-4 uppercase`}>
                            {receivingPlayer ? `${receivingPlayer.name}'S ITEMS` : 'THEIR ITEMS'}
                        </h3>

                        {receivingPlayer ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-orange-700 mb-1">CASH REQUEST ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={receivingPlayer.money}
                                        value={receivingMoney}
                                        onChange={(e) => setReceivingMoney(Math.min(receivingPlayer.money, Math.max(0, parseInt(e.target.value) || 0)))}
                                        className="w-full p-2 border rounded text-black text-sm"
                                    />
                                    <p className="text-[10px] text-orange-600 mt-1">Available: ${receivingPlayer.money}</p>
                                </div>

                                <div className="mb-4">
                                    <button
                                        onClick={() => setReceiveSections(prev => ({ ...prev, props: !prev.props }))}
                                        className="w-full flex justify-between items-center text-xs font-bold text-orange-700 mb-2 border-b border-orange-100 pb-1"
                                    >
                                        <span>PROPERTIES ({receivingProperties.length})</span>
                                        <span>{receiveSections.props ? "▲" : "▼"}</span>
                                    </button>
                                    {receiveSections.props && (
                                        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                            {receivingPlayer.ownables?.map((propName) => (
                                                <PropertyItem
                                                    key={propName}
                                                    name={propName}
                                                    selected={receivingProperties.includes(propName)}
                                                    onClick={() => toggleProperty(propName, "receive")}
                                                    color={ownables?.[propName]?.mortgaged ? "gray" : "orange"}
                                                />
                                            ))}
                                            {(!receivingPlayer.ownables || receivingPlayer.ownables.length === 0) && (
                                                <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <button
                                        onClick={() => setReceiveSections(prev => ({ ...prev, rent: !prev.rent }))}
                                        className="w-full flex justify-between items-center text-xs font-bold text-orange-700 mb-2 border-b border-orange-100 pb-1"
                                    >
                                        <span>FREE RENT ({receivingFreeRent.length})</span>
                                        <span>{receiveSections.rent ? "▲" : "▼"}</span>
                                    </button>
                                    {receiveSections.rent && (
                                        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                            {receivingPlayer.ownables?.map((propName) => (
                                                <PropertyItem
                                                    key={propName}
                                                    name={propName}
                                                    selected={receivingFreeRent.includes(propName)}
                                                    onClick={() => toggleFreeRent(propName, "receive")}
                                                    color={ownables?.[propName]?.mortgaged ? "gray" : "orange"}
                                                />
                                            ))}
                                            {(!receivingPlayer.ownables || receivingPlayer.ownables.length === 0) && (
                                                <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-2">
                                    <button
                                        onClick={() => setReceiveSections(prev => ({ ...prev, income: !prev.income }))}
                                        className="w-full flex justify-between items-center text-xs font-bold text-orange-700 mb-2 border-b border-orange-100 pb-1"
                                    >
                                        <span>SHARED INCOME ({receivingSharedIncome.length})</span>
                                        <span>{receiveSections.income ? "▲" : "▼"}</span>
                                    </button>
                                    {receiveSections.income && (
                                        <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                                            {receivingPlayer.ownables?.map((propName) => (
                                                <PropertyItem
                                                    key={propName}
                                                    name={propName}
                                                    selected={receivingSharedIncome.some((item) => item[0] === propName)}
                                                    onClick={() => toggleSharedIncome(propName, "receive")}
                                                    color={ownables?.[propName]?.mortgaged ? "gray" : "orange"}
                                                />
                                            ))}
                                            {(!receivingPlayer.ownables || receivingPlayer.ownables.length === 0) && (
                                                <div className="text-[10px] text-gray-400 italic">No properties owned</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                                Select an opponent first
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border-2 border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!receivingPlayerId || (
                            offeringMoney === 0 &&
                            receivingMoney === 0 &&
                            offeringProperties.length === 0 &&
                            receivingProperties.length === 0 &&
                            offeringFreeRent.length === 0 &&
                            receivingFreeRent.length === 0 &&
                            offeringSharedIncome.length === 0 &&
                            receivingSharedIncome.length === 0
                        )}
                        className={`px-8 py-2 rounded-lg font-bold text-white shadow-lg transition-all
              ${!receivingPlayerId || (
                                offeringMoney === 0 &&
                                receivingMoney === 0 &&
                                offeringProperties.length === 0 &&
                                receivingProperties.length === 0 &&
                                offeringFreeRent.length === 0 &&
                                receivingFreeRent.length === 0 &&
                                offeringSharedIncome.length === 0 &&
                                receivingSharedIncome.length === 0
                            )
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
                            }`}
                    >
                        SEND TRADE OFFER
                    </button>
                </div>
            </div>
        </div>
    );
}

function PropertyItem({ name, selected, onClick, color }: { name: string; selected: boolean; onClick: () => void; color: "green" | "orange" | "gray" }) {
    const bgColor = selected
        ? (color === "green" ? "bg-green-600 text-white" : color === "orange" ? "bg-orange-600 text-white" : "bg-gray-600 text-white")
        : "bg-white text-black hover:bg-gray-50 border-gray-200";

    return (
        <button
            onClick={onClick}
            className={`p-2 rounded border-2 text-left text-xs font-bold transition-all flex items-center justify-between ${bgColor}`}
        >
            <span className="truncate">{name}</span>
            {selected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )}
        </button>
    );
}
