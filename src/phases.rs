use crate::state::GameState;
use crate::building::BuildingType;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseResult {
    pub name: String,
    pub success: bool,
    pub message: String,
}

pub trait Phase {
    fn execute(&self, state: &mut GameState) -> PhaseResult;
    fn name(&self) -> &str;
    fn order(&self) -> u32;
}

/// Phase 1: RESOURCE — Calculate production from all buildings
pub struct ResourcePhase;

impl Phase for ResourcePhase {
    fn execute(&self, state: &mut GameState) -> PhaseResult {
        let build_speed = 25 + (state.population * 2);
        let mut built_count = 0;

        for building in &mut state.buildings {
            if building.construction_progress < 100 {
                building.construction_progress = building.construction_progress.saturating_add(build_speed);
            }
            
            // Activate building if construction is complete and it has health
            if building.construction_progress >= 100 && building.health > 0 {
                if !building.active {
                    building.active = true;
                    built_count += 1;
                }
                building.construction_progress = 100;
            }
        }

        PhaseResult {
            name: "RESOURCE".to_string(),
            success: true,
            message: if built_count > 0 {
                format!("Construction speed: {}. Completed {} structures.", build_speed, built_count)
            } else {
                format!("Construction speed: {}. Resources preparing...", build_speed)
            },
        }
    }

    fn name(&self) -> &str {
        "RESOURCE"
    }

    fn order(&self) -> u32 {
        1
    }
}

/// Phase 2: PRODUCTION — Apply production to resource pool
pub struct ProductionPhase;

impl Phase for ProductionPhase {
    fn execute(&self, state: &mut GameState) -> PhaseResult {
        // Production is now pre-calculated in advance_phase for UI responsiveness
        let energy_net = state.energy_net();
        let node_net = state.node_net();
        let token_net = state.token_net();

        // Apply environmental drain after tick 100
        let mut env_drain = 0i64;
        if state.tick >= 100 {
            env_drain = (50 + (state.tick as f32 * 1.5) as u64) as i64;
            // Vaults and Shields provide partial mitigation even for constant drain
            let mut mitigation = 0i64;
            for building in &state.buildings {
                if building.active {
                    if building.building_type == BuildingType::Vault { mitigation += 20; }
                    else if building.building_type == BuildingType::ShieldNode { mitigation += 100; }
                }
            }
            env_drain = env_drain.saturating_sub(mitigation);
        }

        // Apply production minus environmental drain
        state.energy = (state.energy + energy_net - env_drain).min(state.energy_cap).max(0);
        state.nodes = (state.nodes + node_net).min(state.node_cap).max(0);
        state.tokens = (state.tokens + token_net).min(state.token_cap).max(0);

        // Blackout penalty
        let mut blackout = false;
        if state.energy == 0 && energy_net < 0 {
            blackout = true;
            for building in &mut state.buildings {
                if building.energy_delta() < 0 && building.active {
                    building.health = building.health.saturating_sub(20);
                    if building.health == 0 {
                        building.active = false;
                    }
                }
            }
        }

        PhaseResult {
            name: "PRODUCTION".to_string(),
            success: true,
            message: if blackout {
                "BLACKOUT! Buildings damaged".to_string()
            } else {
                format!("E:{:+}, N:{:+}, T:{:+}", energy_net, node_net, token_net)
            },
        }
    }

    fn name(&self) -> &str {
        "PRODUCTION"
    }

    fn order(&self) -> u32 {
        2
    }
}

/// Phase 3: POPULATION — Update population based on housing and resources
pub struct PopulationPhase;

impl Phase for PopulationPhase {
    fn execute(&self, state: &mut GameState) -> PhaseResult {
        // Calculate housing capacity
        let mut housing_cap = 0u32;
        for building in &state.buildings {
            if building.active {
                housing_cap += building.population_capacity() as u32;
            }
        }
        state.population_cap = housing_cap;

        // Growth check: if we have excess resources, population grows
        if state.energy > 50 && state.nodes > 30 && state.population < state.population_cap {
            state.population = (state.population + 1).min(state.population_cap);
        }

        PhaseResult {
            name: "POPULATION".to_string(),
            success: true,
            message: format!("Population: {}/{} (Speeds up construction!)", state.population, state.population_cap),
        }
    }

    fn name(&self) -> &str {
        "POPULATION"
    }

    fn order(&self) -> u32 {
        3
    }
}

/// Phase 4: EVENT — Seed-driven events (deterministic, no randomness)
pub struct EventPhase;

impl Phase for EventPhase {
    fn execute(&self, state: &mut GameState) -> PhaseResult {
        // Deterministic event generation based on seed + tick
        let event_seed = state.seed.wrapping_add(state.tick);
        let mut event_type = event_seed % 3; // 0: bonus, 1: drain, 2: neutral

        // Storms only start after tick 100
        if state.tick < 100 && event_type == 1 {
            event_type = 2;
        }

        match event_type {
            0 => {
                // Bonus event: Only if population exists, otherwise small node boost
                if state.population > 0 {
                    state.tokens += (state.population as i64 * 2).min(20);
                    PhaseResult {
                        name: "EVENT".to_string(),
                        success: true,
                        message: format!("REFUND: +{} TOKENS from citizens", (state.population as i64 * 2).min(20)),
                    }
                } else {
                    state.nodes += 20;
                    PhaseResult {
                        name: "EVENT".to_string(),
                        success: true,
                        message: "SCAVENGE: +20 NODES found in ruins".to_string(),
                    }
                }
            }
            1 => {
                // Storm Surge: Additional spike on top of environmental drain
                let mut shield_node_protection = 0;
                for building in &state.buildings {
                    if building.active && building.building_type == BuildingType::ShieldNode {
                        shield_node_protection += 150;
                    }
                }

                let surge_amount = (100 + (state.tick / 2)).saturating_sub(shield_node_protection as u64);
                state.energy = (state.energy - surge_amount as i64).max(0);

                PhaseResult {
                    name: "EVENT".to_string(),
                    success: true,
                    message: format!("STORM SURGE: -{} ENERGY (Shield Nodes blocked {})", surge_amount, shield_node_protection),
                }
            }
            _ => {
                // Neutral event
                PhaseResult {
                    name: "EVENT".to_string(),
                    success: true,
                    message: "No events".to_string(),
                }
            }
        }
    }

    fn name(&self) -> &str {
        "EVENT"
    }

    fn order(&self) -> u32 {
        4
    }
}

/// Phase 5: SNAPSHOT — Serialize state for deterministic proof
pub struct SnapshotPhase;

impl Phase for SnapshotPhase {
    fn execute(&self, state: &mut GameState) -> PhaseResult {
        // Check protocol unlock condition
        state.check_protocol_unlock();

        // Increment tick counter
        state.tick += 1;

        PhaseResult {
            name: "SNAPSHOT".to_string(),
            success: true,
            message: format!("Tick: {}, Protocol: {}", state.tick, state.protocol_active),
        }
    }

    fn name(&self) -> &str {
        "SNAPSHOT"
    }

    fn order(&self) -> u32 {
        5
    }
}

/// Execute one phase step of the cycle
pub fn advance_phase(state: &mut GameState) {
    // 1. Activate any buildings that just finished construction (Rescue logic)
    for building in &mut state.buildings {
        if building.construction_progress >= 100 && building.health > 0 {
            if !building.active {
                building.active = true;
            }
        }
    }

    // 2. Pre-calculate production values for UI responsiveness across ALL phases
    let mut ep = 0i64;
    let mut em = 0i64;
    let mut np = 0i64;
    let mut nm = 0i64;
    let mut tp = 0i64;
    let mut tm = 0i64;

    for building in &state.buildings {
        if building.active {
            let e = building.energy_delta() as i64;
            if e > 0 { ep += e; } else { em += e.abs(); }

            let n = building.node_delta() as i64;
            if n > 0 { np += n; } else { nm += n.abs(); }

            let t = building.token_delta() as i64;
            if t > 0 { tp += t; } else { tm += t.abs(); }
        }
    }

    state.energy_prod = ep;
    state.energy_maint = em;
    state.node_prod = np;
    state.node_maint = nm;
    state.token_prod = tp;
    state.token_maint = tm;

    // 2. Phase selection
    let phases: Vec<Box<dyn Phase>> = vec![
        Box::new(ResourcePhase),
        Box::new(ProductionPhase),
        Box::new(PopulationPhase),
        Box::new(EventPhase),
        Box::new(SnapshotPhase),
    ];

    // Constant Environmental Drain prediction for UI
    let mut mitigation = 0i64;
    for building in &state.buildings {
        if building.active {
            if building.building_type == BuildingType::Vault { mitigation += 20; }
            else if building.building_type == BuildingType::ShieldNode { mitigation += 100; }
        }
    }
    
    if state.tick >= 100 {
        let base_env = (50 + (state.tick as f32 * 1.5) as u64) as i64;
        state.expected_drain = base_env.saturating_sub(mitigation);
    } else {
        state.expected_drain = 0;
    }

    let current = (state.phase_index as usize) % phases.len();
    let phase = &phases[current];

    state.current_phase = phase.name().to_string();
    let _ = phase.execute(state);

    state.phase_index = (state.phase_index + 1) % (phases.len() as u32);
}
