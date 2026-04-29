import { useState, useEffect } from "react";
import { GameState, ResourceValues } from "../types/game";
import { WasmGame } from "../types/wasm";
import { initializeWasm } from "../wasm/init";

/**
 * Hook to load and initialize WASM module
 * Returns game instance, state, and control functions
 */
export const useWasm = () => {
  const [game, setGame] = useState<any>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [resources, setResources] = useState<ResourceValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load WASM module on mount
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = await initializeWasm();
        console.log("WASM module initialized successfully");
        setGame(wasmModule);
        setLoading(false);
      } catch (err) {
        console.error("WASM load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load WASM");
        setLoading(false);
      }
    };

    loadWasm();
  }, []);

  const initGame = (seedStr: string) => {
    if (!game) return;
    try {
      const gameInstance = game.XenusGame.from_string_seed(seedStr);
      const stateStr = gameInstance.get_state();
      const resourceStr = gameInstance.get_resources();

      setState(JSON.parse(stateStr));
      setResources(JSON.parse(resourceStr));

      return gameInstance;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to init game");
      console.error("Game init error:", err);
      return null;
    }
  };

  const updateState = (gameInstance: WasmGame) => {
    try {
      const stateStr = gameInstance.get_state();
      const resourceStr = gameInstance.get_resources();
      setState(JSON.parse(stateStr));
      setResources(JSON.parse(resourceStr));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update state");
      console.error("State update error:", err);
    }
  };

  return {
    game,
    state,
    resources,
    loading,
    error,
    initGame,
    updateState,
  };
};
