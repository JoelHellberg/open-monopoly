import { useParams } from "next/navigation";
import { useGameData } from "../data/gameData";
import { useEffect } from "react";
import { off, onValue, ref } from "firebase/database";
import { GameDataRTDB } from "@/types/databaseTypes";
import { normalizeGameData } from "./helperFunctions";
import { rtdb } from "@/app/_lib/firebase";
import { getBoard } from "@/data/boards";
import { getDefaultGameSettings } from "../gameSettingsConstants";
import { Ownable } from "@/types/gameTypes";
import { verifyGameSession } from "@/app/_lib/session";

export function useSessionSubscriptions() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const updateGameData = useGameData((s) => s.updateGameData);
  const updatePlayerData = useGameData((s) => s.updatePlayerData);
  const updateOwnableData = useGameData((s) => s.updateOwnableData);

  const gameData = useGameData((s) => s.data);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function init() {
      const { playerId } = await verifyGameSession();
      const formattedPlayerId = playerId as string;
      if (!cancelled) {
        useGameData.getState().setOwnPlayerId(formattedPlayerId);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // 1️⃣ Subscribe to main game data
  useEffect(() => {
    if (!sessionId) return;

    const gameRef = ref(rtdb, `games/${sessionId}`);

    return onValue(gameRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const raw = snapshot.val() as GameDataRTDB;
      updateGameData(normalizeGameData(raw));
    });
  }, [sessionId, updateGameData]);
  useEffect(() => {
    if (!sessionId || !gameData) return;

    const settings = gameData.settings || getDefaultGameSettings();
    const board = getBoard(settings.selectedBoard);

    const unsubs = board.map((street) => {
      const ownableRef = ref(
        rtdb,
        `games/${sessionId}/ownables/${street.name}`
      );

      return onValue(ownableRef, (snapshot) => {
        if (snapshot.exists()) {
          updateOwnableData(snapshot.val() as Ownable);
        }
      });
    });

    return () => {
      board.forEach((street) => {
        off(ref(rtdb, `games/${sessionId}/ownables/${street.name}`));
      });
    };
  }, [sessionId, updateOwnableData, gameData]);

  useEffect(() => {
    if (!sessionId || !gameData?.playersInSession.length) return;

    const unsubs = gameData.playersInSession.map((playerId) => {
      const playerRef = ref(rtdb, `games/${sessionId}/players/${playerId}`);

      return onValue(playerRef, (snapshot) => {
        if (snapshot.exists()) {
          updatePlayerData({
            id: playerId,
            ...snapshot.val(),
          });
        }
      });
    });

    return () => {
      gameData.playersInSession.forEach((playerId) => {
        off(ref(rtdb, `games/${sessionId}/players/${playerId}`));
      });
    };
  }, [sessionId, gameData?.playersInSession, updatePlayerData]);
}
