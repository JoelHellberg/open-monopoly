"use client";

import { useGameData } from "./_lib/data/gameData";
import { useParams } from "next/navigation";
import { useState } from "react";
import { updateGameSettings } from "./_lib/server/settingsActions";
import { getDefaultGameSettings } from "./_lib/gameSettingsConstants";
import type { GameSettings } from "@/types/gameTypes";

export default function Settings() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const gameData = useGameData((state) => state.data);
  const ownPlayerId = useGameData((state) => state.ownPlayerId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings: GameSettings = gameData?.settings || getDefaultGameSettings();
  const isHost = gameData?.host === ownPlayerId;

  const handleSettingChange = async (
    key: keyof GameSettings,
    value: string | number | boolean
  ) => {
    try {
      setError(null);
      setIsSaving(true);
      await updateGameSettings(sessionId, { [key]: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full p-5 gap-5 overflow-y-auto">
      <h2 className="text-xl font-bold">Game Settings</h2>

      {error && (
        <div className="w-full p-3 bg-red-200 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">
        {/* Starting Money */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Starting Money per Player</label>
          <input
            type="number"
            value={settings.startingMoney}
            onChange={(e) =>
              handleSettingChange("startingMoney", parseInt(e.target.value))
            }
            disabled={!isHost || isSaving}
            className="px-3 py-2 border rounded-lg bg-white text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
            min="100"
            step="100"
          />
          <span className="text-xs text-gray-500">
            Standard: $1500, Classic: $2000
          </span>
        </div>

        {/* Free Parking */}
        {/* <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.allowFreeParking}
            onChange={(e) => handleSettingChange("allowFreeParking", e.target.checked)}
            disabled={!isHost || isSaving}
            className="w-4 h-4 disabled:cursor-not-allowed"
            id="freeParking"
          />
          <label htmlFor="freeParking" className="font-semibold text-sm cursor-pointer">
            Allow Free Parking Reward
          </label>
        </div> */}

        {/* House Shortage */}
        {/* <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.allowHouseShortage}
            onChange={(e) => handleSettingChange("allowHouseShortage", e.target.checked)}
            disabled={!isHost || isSaving}
            className="w-4 h-4 disabled:cursor-not-allowed"
            id="houseShortage"
          />
          <label htmlFor="houseShortage" className="font-semibold text-sm cursor-pointer">
            Limited House Supply (Shortage possible)
          </label>
        </div> */}

        {/* Selected Board (read-only) */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm">Board</label>
          <select
            value={settings.selectedBoard}
            disabled
            className="px-3 py-2 border rounded-lg bg-gray-100 text-black cursor-not-allowed"
          >
            <option value="default">Standard Monopoly Board</option>
            <option value="allownable">All-Ownable Board</option>
          </select>
          <span className="text-xs text-gray-500">
            Board is selected when hosting the game
          </span>
        </div>

        {!isHost && (
          <div className="w-full p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
            Only the host can change settings before the game starts.
          </div>
        )}

        {isSaving && (
          <div className="w-full p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
