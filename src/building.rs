use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum BuildingType {
    NodeCore,
    EnergyCell,
    RelayTower,
    Vault,
    Miner,
    Housing,
    ShieldNode,
    ProtocolHub,
}

impl BuildingType {
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "NODE_CORE" => Some(BuildingType::NodeCore),
            "ENERGY_CELL" => Some(BuildingType::EnergyCell),
            "RELAY_TOWER" => Some(BuildingType::RelayTower),
            "VAULT" => Some(BuildingType::Vault),
            "MINER" => Some(BuildingType::Miner),
            "HOUSING" => Some(BuildingType::Housing),
            "SHIELD_NODE" => Some(BuildingType::ShieldNode),
            "PROTOCOL_HUB" => Some(BuildingType::ProtocolHub),
            _ => None,
        }
    }

    pub fn to_str(&self) -> &str {
        match self {
            BuildingType::NodeCore => "NODE_CORE",
            BuildingType::EnergyCell => "ENERGY_CELL",
            BuildingType::RelayTower => "RELAY_TOWER",
            BuildingType::Vault => "VAULT",
            BuildingType::Miner => "MINER",
            BuildingType::Housing => "HOUSING",
            BuildingType::ShieldNode => "SHIELD_NODE",
            BuildingType::ProtocolHub => "PROTOCOL_HUB",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            BuildingType::NodeCore => "⬡",
            BuildingType::EnergyCell => "▣",
            BuildingType::RelayTower => "◈",
            BuildingType::Vault => "⬖",
            BuildingType::Miner => "⬠",
            BuildingType::Housing => "◉",
            BuildingType::ShieldNode => "⬡",
            BuildingType::ProtocolHub => "◬",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Building {
    pub id: u32,
    pub building_type: BuildingType,
    pub x: u32,
    pub y: u32,
    pub active: bool,
    pub health: u32,
    pub construction_progress: u32,
}

impl Building {
    pub fn new(id: u32, building_type: BuildingType, x: u32, y: u32) -> Self {
        Building {
            id,
            building_type,
            x,
            y,
            active: false,
            health: 100,
            construction_progress: 0,
        }
    }

    /// Initial placement cost (Energy, Nodes, Tokens)
    pub fn placement_cost(building_type: &BuildingType) -> (i64, i64, i64) {
        match building_type {
            BuildingType::NodeCore => (10, 0, 0),
            BuildingType::EnergyCell => (0, 15, 0),
            BuildingType::RelayTower => (20, 20, 0),
            BuildingType::Vault => (50, 50, 0),
            BuildingType::Miner => (100, 100, 0),
            BuildingType::Housing => (25, 50, 0),
            BuildingType::ShieldNode => (200, 200, 50),
            BuildingType::ProtocolHub => (500, 500, 300),
        }
    }

    /// Energy production/consumption per tick
    pub fn energy_delta(&self) -> i32 {
        match self.building_type {
            BuildingType::NodeCore => 0,
            BuildingType::EnergyCell => 10,
            BuildingType::RelayTower => 0,
            BuildingType::Vault => -1, // consumes energy to run storage
            BuildingType::Miner => -2, // needs energy
            BuildingType::Housing => -1, // needs energy
            BuildingType::ShieldNode => -2, // active protection
            BuildingType::ProtocolHub => -5, // heavy hub consumption
        }
    }

    /// Node production/consumption per tick
    pub fn node_delta(&self) -> i32 {
        match self.building_type {
            BuildingType::NodeCore => 5,
            BuildingType::EnergyCell => 0,
            BuildingType::RelayTower => 1, // boost adjacent nodes
            BuildingType::Vault => 0,
            BuildingType::Miner => -1, // uses nodes
            BuildingType::Housing => -1, // uses nodes for population support
            BuildingType::ShieldNode => 1, // produces nodes
            BuildingType::ProtocolHub => 5, // generates nodes
        }
    }

    /// Token production/consumption per tick
    pub fn token_delta(&self) -> i32 {
        match self.building_type {
            BuildingType::NodeCore => 0,
            BuildingType::EnergyCell => 0,
            BuildingType::RelayTower => 0,
            BuildingType::Vault => 0,
            BuildingType::Miner => 2, // main token producer
            BuildingType::Housing => 0,
            BuildingType::ShieldNode => 0,
            BuildingType::ProtocolHub => 5, // high token output
        }
    }

    /// Population capacity
    pub fn population_capacity(&self) -> i32 {
        match self.building_type {
            BuildingType::Housing => 5,
            _ => 0,
        }
    }
}
