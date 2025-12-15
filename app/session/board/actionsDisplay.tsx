"use client";
import Dice from "@/components/dice";
import { useState } from "react";

export default function ActionsDisplay() {
  const [showDiceRoll, setShowDiceRoll] = useState(true);
  return (
    <div className="absolute inset-0 m-auto flex flex-col gap-5 items-center justify-center z-10">
      <div className="flex gap-5">
        <Dice numberOfSides={5}/>
        <Dice />
      </div>
      {showDiceRoll ? <ThrowDice /> : <BuyProperty />}

      {/* For development, delete later */}
      <button
        onClick={() => setShowDiceRoll(!showDiceRoll)}
        className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer"
      >
        Change
      </button>
    </div>
  );
}

function ThrowDice() {
  return (
    <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer">
      Throw Dice
    </button>
  );
}

function BuyProperty() {
  return (
    <div className="flex gap-5">
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer">
        Purchase
      </button>
      <button className="p-2 text-black bg-white rounded-md shadow-md hover:bg-gray-200 hover:cursor-pointer">
        Auction
      </button>
    </div>
  );
}
