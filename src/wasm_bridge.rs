use wasm_bindgen::prelude::*;
use crate::state::GameState;
use crate::phases::advance_phase;
use crate::seed::fnv1a_hash;

/// WASM wrapper for the XENUS_SETTLEMENT game
#[wasm_bindgen]
pub struct XenusGame {
    state: GameState,
    initial_seed: u64,
}

#[wasm_bindgen]
impl XenusGame {
    /// Initialize game with a u64 seed
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64) -> XenusGame {
        let mut state = GameState::new(seed);
        // Place a starter NODE_CORE building at (5, 5) and set it to active
        let _ = state.place_building(5, 5, "NODE_CORE");
        if let Some(b) = state.buildings.iter_mut().next() {
            b.active = true;
            b.construction_progress = 100;
        }
        
        XenusGame {
            state,
            initial_seed: seed,
        }
    }

    /// Initialize game with a text seed (hashed to u64)
    pub fn from_string_seed(seed_str: &str) -> XenusGame {
        let seed = fnv1a_hash(seed_str);
        XenusGame::new(seed)
    }

    /// Execute one cycle of phases and return updated state as JSON
    pub fn tick(&mut self) -> String {
        advance_phase(&mut self.state);
        serde_json::to_string(&self.state).unwrap_or_else(|_| "{}".to_string())
    }

    /// Place a building at grid position (x, y)
    pub fn place_building(&mut self, x: u32, y: u32, building_type: &str) -> String {
        match self.state.place_building(x, y, building_type) {
            Ok(_) => "OK".to_string(),
            Err(e) => e,
        }
    }

    /// Get current game state as JSON
    pub fn get_state(&self) -> String {
        serde_json::to_string(&self.state).unwrap_or_else(|_| "{}".to_string())
    }

    /// Reset to initial state (seed-driven replay)
    pub fn reset(&mut self) {
        self.state = GameState::new(self.initial_seed);
        let _ = self.state.place_building(5, 5, "NODE_CORE");
        if let Some(b) = self.state.buildings.iter_mut().next() {
            b.active = true;
            b.construction_progress = 100;
        }
    }

    /// Get current tick count
    pub fn get_tick(&self) -> u64 {
        self.state.tick
    }

    /// Get protocol status
    pub fn is_protocol_active(&self) -> bool {
        self.state.protocol_active
    }

    /// Get current resource values
    pub fn get_resources(&self) -> String {
        let resources = serde_json::json!({
            "energy": self.state.energy,
            "nodes": self.state.nodes,
            "tokens": self.state.tokens,
            "energy_prod": self.state.energy_prod,
            "energy_maint": self.state.energy_maint,
            "node_prod": self.state.node_prod,
            "node_maint": self.state.node_maint,
            "token_prod": self.state.token_prod,
            "token_maint": self.state.token_maint,
            "expected_drain": self.state.expected_drain,
        });
        serde_json::to_string(&resources).unwrap_or_else(|_| "{}".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_determinism_same_seed() {
        // Create two games with the same seed
        let mut game1 = XenusGame::new(42);
        let mut game2 = XenusGame::new(42);

        // Run 10 ticks on both
        for _ in 0..10 {
            game1.tick();
            game2.tick();
        }

        // Extract states as JSON
        let state1 = game1.get_state();
        let state2 = game2.get_state();

        // Compare JSON strings (should be identical)
        assert_eq!(
            state1, state2,
            "Identical seeds must produce identical game states"
        );

        println!("✓ Determinism test passed!");
        println!("State:\n{}", state1);
    }

    #[test]
    fn test_string_seed_hashing() {
        let game1 = XenusGame::from_string_seed("xenus_test");
        let game2 = XenusGame::from_string_seed("xenus_test");

        assert_eq!(game1.state.seed, game2.state.seed);
    }

    #[test]
    fn test_building_placement() {
        let mut game = XenusGame::new(42);
        
        // Try to place ENERGY_CELL (requires nothing, but costs energy)
        // Wait, EnergyCell costs 15 NODES. Initial state has 50 NODES.
        let result = game.place_building(6, 6, "ENERGY_CELL");
        assert_eq!(result, "OK");

        // Try to place at same location (should fail)
        let result = game.place_building(6, 6, "MINER");
        assert_eq!(result, "Cell is occupied");

        // Out of bounds
        let result = game.place_building(20, 20, "ENERGY_CELL");
        assert_eq!(result, "Out of bounds");
    }

    #[test]
    fn test_protocol_unlock() {
        let mut game = XenusGame::new(42);
        
        // Manually set resources to trigger protocol unlock
        game.state.nodes = 600;
        game.state.tokens = 150;
        game.state.energy = 300;
        
        // Call snapshot phase directly to trigger check
        game.state.check_protocol_unlock();
        
        assert!(game.is_protocol_active());
    }
}
