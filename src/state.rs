use crate::building::{Building, BuildingType};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub seed: u64,
    pub tick: u64,
    pub current_phase: String,
    pub phase_index: u32,

    // Resources
    pub energy: i64,
    pub nodes: i64,
    pub tokens: i64,

    // Capacity thresholds
    pub energy_cap: i64,
    pub node_cap: i64,
    pub token_cap: i64,

    // Current production deltas
    pub energy_prod: i64,
    pub energy_maint: i64,
    pub node_prod: i64,
    pub node_maint: i64,
    pub token_prod: i64,
    pub token_maint: i64,
    pub expected_drain: i64,

    // Population
    pub population: u32,
    pub population_cap: u32,

    // Buildings
    pub buildings: Vec<Building>,
    pub next_building_id: u32,
    pub grid: HashMap<String, u32>, // "x,y" → building_id

    // Simulation state
    pub protocol_active: bool,
}

impl GameState {
    pub fn energy_net(&self) -> i64 { self.energy_prod - self.energy_maint }
    pub fn node_net(&self) -> i64 { self.node_prod - self.node_maint }
    pub fn token_net(&self) -> i64 { self.token_prod - self.token_maint }

    pub fn new(seed: u64) -> Self {
        GameState {
            seed,
            tick: 0,
            current_phase: "INIT".to_string(),
            phase_index: 0,
            energy: 100,
            nodes: 50,
            tokens: 10,
            energy_cap: 5000,
            node_cap: 5000,
            token_cap: 5000,
            energy_prod: 0,
            energy_maint: 0,
            node_prod: 0,
            node_maint: 0,
            token_prod: 0,
            token_maint: 0,
            expected_drain: 0,
            population: 0,
            population_cap: 50,
            buildings: Vec::new(),
            next_building_id: 1,
            grid: HashMap::new(),
            protocol_active: false,
        }
    }

    /// Place a building at grid position (x, y)
    pub fn place_building(&mut self, x: u32, y: u32, building_type: &str) -> Result<(), String> {
        if x >= 12 || y >= 12 {
            return Err("Out of bounds".to_string());
        }

        let coord_key = format!("{},{}", x, y);
        if self.grid.contains_key(&coord_key) {
            return Err("Cell is occupied".to_string());
        }

        // Parse building type
        let building_type = match BuildingType::from_str(building_type) {
            Some(bt) => bt,
            None => return Err("Invalid building type".to_string()),
        };

        // Tech Tree / Prerequisite Check
        let has_active = |bt: BuildingType| self.buildings.iter().any(|b| b.building_type == bt && b.active);
        
        match building_type {
            BuildingType::Housing | BuildingType::Vault => {
                if !has_active(BuildingType::RelayTower) {
                    return Err("Need RELAY TOWER active".to_string());
                }
            },
            BuildingType::Miner => {
                if !has_active(BuildingType::Housing) {
                    return Err("Need HOUSING active".to_string());
                }
            },
            BuildingType::ShieldNode => {
                if !has_active(BuildingType::Miner) {
                    return Err("Need MINER active".to_string());
                }
            },
            BuildingType::ProtocolHub => {
                if !has_active(BuildingType::ShieldNode) {
                    return Err("Need SHIELD NODE active".to_string());
                }
            },
            _ => {}, // Base buildings
        };

        // Check placement cost
        let (cost_e, cost_n, cost_t) = Building::placement_cost(&building_type);
        if self.energy < cost_e || self.nodes < cost_n || self.tokens < cost_t {
            if self.energy < cost_e {
                return Err(format!("Not enough ENERGY (need {})", cost_e));
            }
            if self.nodes < cost_n {
                return Err(format!("Not enough NODES (need {})", cost_n));
            }
            return Err(format!("Not enough TOKENS (need {})", cost_t));
        }

        // Deduct cost
        self.energy -= cost_e;
        self.nodes -= cost_n;
        self.tokens -= cost_t;

        // Create building
        let building = Building::new(self.next_building_id, building_type, x, y);
        self.buildings.push(building.clone());
        self.grid.insert(coord_key, self.next_building_id);
        self.next_building_id += 1;

        Ok(())
    }

    /// Remove a building (if needed)
    pub fn remove_building(&mut self, building_id: u32) -> bool {
        if let Some(idx) = self.buildings.iter().position(|b| b.id == building_id) {
            let building = self.buildings.remove(idx);
            self.grid.remove(&format!("{},{}", building.x, building.y));
            return true;
        }
        false
    }

    /// Check if protocol is unlocked (threshold check)
    pub fn check_protocol_unlock(&mut self) {
        let has_hub = self.buildings.iter().any(|b| b.building_type == BuildingType::ProtocolHub && b.active);
        if !self.protocol_active && self.nodes >= 2500 && self.tokens >= 1500 && has_hub {
            self.protocol_active = true;
        }
    }
}
