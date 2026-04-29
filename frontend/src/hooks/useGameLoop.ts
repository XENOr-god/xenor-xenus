import { useState, useEffect, useRef, useCallback } from "react";
import { WasmGame } from "../types/wasm";
import { GameState } from "../types/game";

interface UseGameLoopProps {
  gameInstance: WasmGame | null;
  onStateUpdate: (state: GameState) => void;
  fps?: number; // Default 10 FPS for deterministic gameplay
  enabled?: boolean;
}

/**
 * Game loop hook using requestAnimationFrame
 * Executes one WASM tick per frame, updates React state
 */
export const useGameLoop = ({
  gameInstance,
  onStateUpdate,
  fps = 5,
  enabled = false,
}: UseGameLoopProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (!gameInstance) return;
    try {
      const stateStr = gameInstance.tick();
      const newState = JSON.parse(stateStr) as GameState;
      onStateUpdate(newState);
    } catch (err) {
      console.error("Game loop tick failed:", err);
    }
  }, [gameInstance, onStateUpdate]);

  useEffect(() => {
    if (enabled && gameInstance) {
      setIsRunning(true);
      timerRef.current = window.setInterval(tick, 1000 / fps);
    } else {
      setIsRunning(false);
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, gameInstance, fps, tick]);

  const pause = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  const resume = () => {
    if (enabled && gameInstance && !isRunning) {
      setIsRunning(true);
      timerRef.current = window.setInterval(tick, 1000 / fps);
    }
  };

  return {
    isRunning,
    pause,
    resume,
  };
};
