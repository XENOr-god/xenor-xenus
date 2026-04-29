import React, { useState, useEffect, useCallback } from "react";
import { GameState, BuildingType, ResourceValues } from "./types/game";
import { XenusGame } from "./wasm/xenor_xenus";
import { initializeWasm } from "./wasm/init";
import { GameGrid } from "./components/GameGrid";
import { BuildingPalette } from "./components/BuildingPalette";
import { ResourceBar } from "./components/ResourceBar";
import { PhaseIndicator } from "./components/PhaseIndicator";
import { SeedInput } from "./components/SeedInput";
import "./styles/theme.css";
import "./styles/App.css";

const TICK_RATE = 1000;

export const App: React.FC = () => {
  const [gameInstance, setGameInstance] = useState<XenusGame | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

  const updateState = useCallback((game: XenusGame) => {
    const stateStr = game.get_state();
    const newState = JSON.parse(stateStr) as GameState;
    setState(newState);
  }, []);

  const handleSeedSubmit = useCallback(async (seedString: string) => {
    setLoading(true);
    try {
      const wasm = await initializeWasm();
      const game = wasm.XenusGame.from_string_seed(seedString || "xenus_settlement");
      setGameInstance(game);
      updateState(game);
      
      // Update URL to maintain determinism
      const newPath = `/=${seedString || "xenus_settlement"}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, "", newPath);
      }
    } catch (err) {
      console.error("Failed to load WASM:", err);
    } finally {
      setLoading(false);
    }
  }, [updateState]);

  // Initial load from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith("/=")) {
      const urlSeed = decodeURIComponent(path.substring(2));
      if (urlSeed) {
        handleSeedSubmit(urlSeed);
      }
    }
  }, [handleSeedSubmit]);

  const togglePause = () => setPaused(!paused);
  
  const handleReset = () => {
    setGameInstance(null);
    setState(null);
    setPaused(true);
    // Clear seed from URL
    window.history.pushState({}, "", "/");
  };

  const handleTick = useCallback(() => {
    if (gameInstance) {
      gameInstance.tick();
      updateState(gameInstance);
    }
  }, [gameInstance, updateState]);

  useEffect(() => {
    let interval: number;
    if (!paused && gameInstance) {
      interval = window.setInterval(handleTick, TICK_RATE);
    }
    return () => clearInterval(interval);
  }, [paused, gameInstance, handleTick]);

  const handleCellClick = (x: number, y: number) => {
    if (gameInstance && selectedBuilding) {
      const result = gameInstance.place_building(x, y, selectedBuilding);
      if (result === "OK") {
        updateState(gameInstance);
        setLastError(null);
      } else {
        setLastError(result);
        // Clear error after 3 seconds
        setTimeout(() => setLastError(null), 3000);
      }
    }
  };

  const resources: ResourceValues | null = state ? {
    energy: state.energy,
    nodes: state.nodes,
    tokens: state.tokens,
    energy_prod: state.energy_prod,
    energy_maint: state.energy_maint,
    node_prod: state.node_prod,
    node_maint: state.node_maint,
    token_prod: state.token_prod,
    token_maint: state.token_maint,
    expected_drain: state.expected_drain
  } : null;

  if (loading) {
    return (
      <div className="app-viewport">
        <div className="loading-overlay">
          <div className="loading-text gold">INITIALIZING NEURAL CORE...</div>
          <div className="loading-bar">
            <div className="loading-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-viewport">
      {!gameInstance ? (
        <section className="startup-view">
          <div className="startup-container">
            <header className="startup-header">
              <img src="/assets/xenus-logo.png" alt="XENUS" className="startup-logo" />
              <div className="startup-line"></div>
              <p className="startup-subtitle">NEURAL_SIMULATION_PROTOCOL // VERSION_1.0.4</p>
            </header>

            <div className="startup-body">
              <p className="startup-msg">INITIALIZE DETERMINISTIC SETTLEMENT DATA</p>
              <SeedInput onSubmit={handleSeedSubmit} />
            </div>
          </div>
        </section>
      ) : (
        <div className="simulation-deck">
          <aside className="sidebar-left">
            <div className="sidebar-section brand-section">
              <div className="logo-area">
                <img src="/assets/xenus-logo.png" alt="XENUS" className="main-app-logo" />
              </div>
            </div>

            <BuildingPalette
              selectedBuilding={selectedBuilding}
              onSelectBuilding={setSelectedBuilding}
              resources={resources}
            />

            <div className="sidebar-footer-stats">
              <div className="sidebar-section selected-box">
                <h3 className="section-title"><span className="scan-node"></span> SELECTED:</h3>
                <div className="selected-module-display">
                  <div className="selected-icon-mini">[*]</div>
                  <div className="selected-name-mini">{selectedBuilding || "NONE"}</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="main-viewport">
            <header className="dashboard-header">
              <ResourceBar
                resources={resources}
                tick={state?.tick || 0}
                caps={{
                  energy: state?.energy_cap || 5000,
                  nodes: state?.node_cap || 5000,
                  tokens: state?.token_cap || 5000
                }}
              />

              <div className="header-controls">
                <button className="control-btn-v2" onClick={togglePause}>
                  {paused ? "▶ RESUME" : "Ⅱ PAUSE"}
                </button>
                <button className="control-btn-v2" onClick={handleTick} disabled={!paused}>
                  ⏭ STEP
                </button>
                <button className="control-btn-v2 danger" onClick={handleReset}>
                  ⟲ RESET
                </button>
              </div>
            </header>


            <section className="simulation-area">
              <div className="grid-content-wrapper">
                <div className="grid-column">
                  <div className={`grid-header-info ${lastError ? "has-error" : ""}`}>
                    {lastError ? (
                      <span className="error-msg">
                        <span className="error-icon">⚠</span> SYSTEM_DENIED: <span className="error-text">{lastError.toUpperCase()}</span>
                      </span>
                    ) : (
                      <>
                        <span>SELECTED_MODULE: <span className="info-highlight">{selectedBuilding || "NONE"}</span></span>
                        <span className="info-muted">[PLACE_ON_GRID]</span>
                      </>
                    )}
                  </div>

                  <GameGrid
                    grid={state?.grid || {}}
                    buildings={state?.buildings || []}
                    onCellClick={handleCellClick}
                    selectedBuilding={selectedBuilding}
                  />
                </div>

                <div className="tactical-goals-panel">
                  <div className="seed-telemetry-box">
                    <div className="seed-label-telemetry">CURRENT_SEED:</div>
                    <div className="seed-value-telemetry">{state?.seed.toString() || "NONE"}</div>
                    <div className="side-seed-input">
                      <SeedInput onSubmit={handleSeedSubmit} />
                    </div>
                  </div>

                  <div className="goals-box">
                    <h3 className="section-title"><span className="scan-node"></span> MAIN_GOALS</h3>
                    <div className="goals-progress-list">
                      <div className="goal-progress-item">
                        <div className="goal-info-top">
                          <span className="goal-label-icon">⌬</span>
                          <span className="goal-label-text">NODES</span>
                          <span className="goal-numbers">{(state?.nodes || 0).toFixed(0)}/2.5K</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (state?.nodes || 0) / 25)}%` }}></div>
                        </div>
                      </div>

                      <div className="goal-progress-item">
                        <div className="goal-info-top">
                          <span className="goal-label-icon">▰</span>
                          <span className="goal-label-text">TOKENS</span>
                          <span className="goal-numbers">{(state?.tokens || 0).toFixed(0)}/1.5K</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (state?.tokens || 0) / 15)}%` }}></div>
                        </div>
                      </div>

                      <div className="goal-progress-item">
                        <div className="goal-info-top">
                          <span className="goal-label-icon">◬</span>
                          <span className="goal-label-text">PROTOCOL_HUB</span>
                          <span className="goal-numbers">{state?.buildings.filter(b => b.building_type === BuildingType.ProtocolHub).length || 0}/1</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-fill" style={{ width: `${Math.min(100, (state?.buildings.filter(b => b.building_type === BuildingType.ProtocolHub).length || 0) * 100)}%` }}></div>
                        </div>
                      </div>

                      <div className="goal-progress-item status-item">
                        <div className="goal-info-top">
                          <span className="goal-label-icon">[*]</span>
                          <span className="goal-label-text">STATUS</span>
                          <span className="status-text gold">{state?.protocol_active ? "READY" : "LINK..."}</span>
                        </div>
                        <div className="status-stripe-bar">
                          <div className={`stripe-fill ${state?.protocol_active ? "active" : "animating"}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <footer className="app-footer">
              <div className="footer-left">
                <img src="/assets/xenus-logo.png" alt="" className="footer-mini-logo" />
                Xenus Settlement v0.1.0 from Xenor Protocol v1.0.4
              </div>
              <div className="footer-right">Powered by Rust + WASM + React</div>
            </footer>
          </main>
        </div>
      )}
    </div>
  );
};
