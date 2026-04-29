import React from "react";
import { ResourceValues } from "../types/game";
import "../styles/ResourceBar.css";

interface ResourceBarProps {
  resources: ResourceValues | null;
  tick: number;
  caps: {
    energy: number;
    nodes: number;
    tokens: number;
  };
}

/**
 * High-fidelity Resource Bar matching the reference design
 */
export const ResourceBar: React.FC<ResourceBarProps> = ({
  resources,
  tick,
  caps,
}) => {
  const getPercentage = (value: number, cap: number) =>
    Math.min(100, Math.max(0, (value / (cap || 1)) * 100));

  return (
    <div className="resource-bar-v2">
      {/* CLOCK */}
      <div className="res-item-v2 clock-node">
        <div className="res-meta-v2">
          <span className="res-name-v2">CLOCK</span>
          <span className="res-delta-v2 gold">TICK_ID</span>
        </div>
        <div className="res-values-v2">
          <div className="res-current-v2 gold">{tick.toString().padStart(5, '0')}</div>
        </div>
      </div>

      {/* ENERGY */}
      <div className="res-item-v2">
        <div className="res-icon-v2">◈</div>
        <div className="res-meta-v2">
          <span className="res-name-v2">ENERGY</span>
          <div className="res-breakdown-v2">
            <span className="prod-gain">+{resources?.energy_prod || 0}</span>
            <span className="maint-loss">-{resources?.energy_maint || 0}</span>
          </div>
        </div>
        <div className="res-values-v2">
          <div className="res-current-v2 gold">{resources?.energy || 0}</div>
          <div className="res-cap-row-v2">
            <div className="res-bar-mini">
              <div className="res-fill-mini" style={{ width: `${getPercentage(resources?.energy || 0, caps.energy)}%` }}></div>
            </div>
            <span className="res-cap-v2">/ {caps.energy}</span>
          </div>
        </div>
      </div>

      {/* NODES */}
      <div className="res-item-v2">
        <div className="res-icon-v2">⌬</div>
        <div className="res-meta-v2">
          <span className="res-name-v2">NODES</span>
          <div className="res-breakdown-v2">
            <span className="prod-gain">+{resources?.node_prod || 0}</span>
            <span className="maint-loss">-{resources?.node_maint || 0}</span>
          </div>
        </div>
        <div className="res-values-v2">
          <div className="res-current-v2 gold">{resources?.nodes || 0}</div>
          <div className="res-cap-row-v2">
            <div className="res-bar-mini">
              <div className="res-fill-mini" style={{ width: `${getPercentage(resources?.nodes || 0, caps.nodes)}%` }}></div>
            </div>
            <span className="res-cap-v2">/ {caps.nodes}</span>
          </div>
        </div>
      </div>

      {/* TOKENS */}
      <div className="res-item-v2">
        <div className="res-icon-v2">▰</div>
        <div className="res-meta-v2">
          <span className="res-name-v2">TOKENS</span>
          <div className="res-breakdown-v2">
            <span className="prod-gain">+{resources?.token_prod || 0}</span>
            <span className="maint-loss">-{resources?.token_maint || 0}</span>
          </div>
        </div>
        <div className="res-values-v2">
          <div className="res-current-v2 gold">{resources?.tokens || 0}</div>
          <div className="res-cap-row-v2">
            <div className="res-bar-mini">
              <div className="res-fill-mini" style={{ width: `${getPercentage(resources?.tokens || 0, caps.tokens)}%` }}></div>
            </div>
            <span className="res-cap-v2">/ {caps.tokens}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
