import React, { useState } from "react";
import { BuildingType, BUILDING_ROSTER } from "../types/game";
import "../styles/GameGrid.css";

interface GameGridProps {
  grid: Record<string, number>;
  buildings: any[];
  onCellClick: (x: number, y: number) => void;
  selectedBuilding: BuildingType | null;
}

/**
 * High-fidelity 12x12 Grid renderer with tactical overlays
 */
export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  buildings,
  onCellClick,
  selectedBuilding,
}) => {
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  const isCellOccupied = (x: number, y: number): boolean => {
    return grid.hasOwnProperty(`${x},${y}`);
  };

  const getBuildingAtCell = (x: number, y: number) => {
    const buildingId = grid[`${x},${y}`];
    return buildings.find((b) => b.id === buildingId) || null;
  };

  const getBuildingMetadata = (type: BuildingType) => {
    return BUILDING_ROSTER.find(b => b.type === type);
  };

  const renderBuildingVisual = (type: BuildingType, isGhost = false) => {
    const meta = getBuildingMetadata(type);
    if (meta?.image) {
      return <img src={meta.image} alt={type} className={`grid-building-render ${isGhost ? "ghost" : ""}`} />;
    }
    
    if (type === BuildingType.NodeCore || type === BuildingType.ShieldNode || type === BuildingType.ProtocolHub) {
      return <div className="shape-hex-outline"></div>;
    }
    return <div className="shape-square-outline"><div className="inner-dot"></div></div>;
  };

  return (
    <div className="game-grid-wrapper">
      <div className="grid-corner tl"></div>
      <div className="grid-corner tr"></div>
      <div className="grid-corner bl"></div>
      <div className="grid-corner br"></div>
      
      <div className="game-grid-v2">
        {Array.from({ length: 144 }).map((_, idx) => {
          const x = idx % 12;
          const y = Math.floor(idx / 12);
          const occupied = isCellOccupied(x, y);
          const building = getBuildingAtCell(x, y);
          const isHovered = hoveredCell?.[0] === x && hoveredCell?.[1] === y;

          return (
            <div
              key={`cell-${x}-${y}`}
              className={`grid-cell-v2 ${occupied ? "occupied" : ""} ${isHovered ? "hovered" : ""}`}
              onClick={() => onCellClick(x, y)}
              onMouseEnter={() => setHoveredCell([x, y])}
              onMouseLeave={() => setHoveredCell(null)}
            >
              <div className="cell-dot"></div>
              
              {building && (
                <div className={`building-tile-v2 ${building.active ? "active" : "inactive"}`}>
                  {renderBuildingVisual(building.building_type)}
                  
                  {building.construction_progress < 100 && (
                      <div className="building-progress-v2" style={{height: `${building.construction_progress}%`}}></div>
                  )}
                </div>
              )}
              
              {isHovered && !occupied && selectedBuilding && (
                <div className="placement-ghost">
                  {renderBuildingVisual(selectedBuilding, true)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
