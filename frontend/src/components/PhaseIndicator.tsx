import React from "react";
import "../styles/PhaseIndicator.css";

const PHASES_V2 = ["INIT", "BUILD", "CONNECT", "EXECUTE", "COMPLETE"];

interface PhaseIndicatorProps {
  currentPhase: string;
  tick: number;
  isRunning: boolean;
}

/**
 * High-fidelity Phase Indicator matching the reference design
 */
export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  currentPhase,
}) => {
  // Map internal engine phases to UI display phases if necessary
  const getPhaseIndex = (phase: string) => {
    const p = phase.toUpperCase();
    if (p.includes("RESOURCE")) return 0;
    if (p.includes("PRODUCTION")) return 1;
    if (p.includes("POPULATION")) return 2;
    if (p.includes("EVENT")) return 3;
    if (p.includes("SNAPSHOT")) return 4;
    return 0;
  };

  const currentIndex = getPhaseIndex(currentPhase);

  return (
    <div className="phase-indicator-v2">
      <div className="phase-track-v2">
        <div className="phase-progress-line-v2" style={{ width: `${(currentIndex / 4) * 100}%` }}></div>
        
        {PHASES_V2.map((phase, index) => (
          <div key={phase} className={`phase-node-v2 ${index <= currentIndex ? "active" : ""}`}>
            <div className="node-dot-v2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
