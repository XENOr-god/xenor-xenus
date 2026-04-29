// TypeScript definitions for GameState from Rust backend

export interface Building {
  id: number;
  building_type: BuildingType;
  x: number;
  y: number;
  active: boolean;
  health: number;
  construction_progress: number;
  icon?: string; // Optional icon for UI rendering
}

export enum BuildingType {
  NodeCore = "NODE_CORE",
  EnergyCell = "ENERGY_CELL",
  RelayTower = "RELAY_TOWER",
  Vault = "VAULT",
  Miner = "MINER",
  Housing = "HOUSING",
  ShieldNode = "SHIELD_NODE",
  ProtocolHub = "PROTOCOL_HUB",
}

export interface GameState {
  seed: number;
  tick: number;
  current_phase: string;
  energy: number;
  nodes: number;
  tokens: number;
  energy_cap: number;
  node_cap: number;
  token_cap: number;
  energy_prod: number;
  energy_maint: number;
  node_prod: number;
  node_maint: number;
  token_prod: number;
  token_maint: number;
  expected_drain: number;
  population: number;
  population_cap: number;
  buildings: Building[];
  next_building_id: number;
  grid: Record<string, number>;
  protocol_active: boolean;
}

export interface ResourceValues {
  energy: number;
  nodes: number;
  tokens: number;
  energy_prod: number;
  energy_maint: number;
  node_prod: number;
  node_maint: number;
  token_prod: number;
  token_maint: number;
  expected_drain: number;
}

// Building metadata for UI
export const BUILDING_ROSTER = [
  {
    type: BuildingType.NodeCore,
    name: "NODE_CORE",
    icon: "⬡",
    image: "/assets/buildings/node_core.png",
    cost: "Cost: 10 ENG",
    description: "Prod: +5 NODES",
    stat: "Base building",
  },
  {
    type: BuildingType.EnergyCell,
    name: "ENERGY_CELL",
    icon: "▣",
    image: "/assets/buildings/energy_cell.png",
    cost: "Cost: 15 NODES",
    description: "Prod: +10 ENERGY",
    stat: "Powers others",
  },
  {
    type: BuildingType.RelayTower,
    name: "RELAY_TOWER",
    icon: "◈",
    image: "/assets/buildings/relay_tower.png",
    cost: "Cost: 20 ENG, 20 NODES",
    description: "Prod: +1 NODE",
    stat: "Network extension",
  },
  {
    type: BuildingType.Vault,
    name: "VAULT",
    icon: "⬖",
    image: "/assets/buildings/vault.png",
    cost: "Cost: 50 ENG, 50 NODES",
    description: "Drain: -1 ENG | Effect: Blocks 50 EVENT Drain",
    stat: "Req: RELAY TOWER",
  },
  {
    type: BuildingType.Miner,
    name: "MINER",
    icon: "⬠",
    image: "/assets/buildings/miner.png",
    cost: "Cost: 100 ENG, 100 NODES",
    description: "Drain: -2 ENG, -1 NODE | Prod: +2 TOKENS",
    stat: "Req: HOUSING",
  },
  {
    type: BuildingType.Housing,
    name: "HOUSING",
    icon: "◉",
    image: "/assets/buildings/housing.png",
    cost: "Cost: 25 ENG, 50 NODES",
    description: "Drain: -1 ENG, -1 NODE | Effect: Speeds Build",
    stat: "Req: RELAY TOWER",
  },
  {
    type: BuildingType.ShieldNode,
    name: "SHIELD_NODE",
    icon: "⬡",
    image: "/assets/buildings/shield_node.png",
    cost: "Cost: 200 ENG, 200 NODES, 50 TOKENS",
    description: "Drain: -2 ENG | Blocks 250 EVENT Drain",
    stat: "Req: MINER",
  },
  {
    type: BuildingType.ProtocolHub,
    name: "PROTOCOL_HUB",
    icon: "◬",
    image: "/assets/buildings/protocol_hub.png",
    cost: "Cost: 500 ENG, 500 NODES, 300 TOKENS",
    description: "Drain: -5 ENG | Prod: +5 NODES, +5 TOKENS",
    stat: "Req: SHIELD NODE",
  },
];
