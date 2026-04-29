import React from "react";
import { BuildingType, BUILDING_ROSTER } from "../types/game";
import "../styles/BuildingPalette.css";

interface BuildingPaletteProps {
  selectedBuilding: BuildingType | null;
  onSelectBuilding: (building: BuildingType) => void;
  resources: any;
}

/**
 * Side panel showing all building types
 * Redesigned to match the high-fidelity reference
 */
export const BuildingPalette: React.FC<BuildingPaletteProps> = ({
  selectedBuilding,
  onSelectBuilding,
}) => {
  return (
    <div className="building-palette-container">
      <div className="palette-header">
        <div className="palette-title-group">
          <span className="palette-icon">➜</span>
          <span className="palette-label">BUILDING TYPES</span>
          <div className="palette-line-deco">
            <div className="line"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>

      <div className="building-list">
        {BUILDING_ROSTER.map((building) => (
          <button
            key={building.type}
            className={`building-card-v2 ${selectedBuilding === building.type ? "selected" : ""
              }`}
            onClick={() => onSelectBuilding(building.type)}
          >
            <div className="card-hex-frame">
              <div className="hex-inner-content">
                {building.image ? (
                  <img src={building.image} alt={building.name} className="building-render-v2" />
                ) : (
                  building.icon
                )}
              </div>
            </div>

            <div className="card-main-content">
              <div className="card-title-row">
                <span className="card-name">{building.name}</span>
                <div className={`selection-indicator ${selectedBuilding === building.type ? "active" : ""}`}>
                  <div className="indicator-dot"></div>
                </div>
              </div>

              <div className="card-req-row">
                <span className="req-label">{building.stat.startsWith("Req:") ? building.stat.toUpperCase() : "BASE MODULE"}</span>
              </div>

              <div className="card-cost-row">
                <span className="cost-text">{building.cost.toUpperCase()}</span>
              </div>

              <div className="card-details-row">
                <span className="details-text">{building.description}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
