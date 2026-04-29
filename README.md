# XENUS: Tactical Simulation Interface

XENUS is a high-density settlement simulation interface engineered as the primary operational component of the XENOr Protocol. Built upon a foundation of absolute determinism, XENUS enables precise management and reproduction of simulation states, adhering to the rigorous technical standards defined by the XENOr framework.

## Architectural Refactor: Midnight Gold Edition

This release represents a comprehensive structural overhaul, transitioning the system into a production-ready operational environment. The refactor prioritizes reproducibility, interface stability, and high-fidelity data visualization.

### Deterministic State Management
The core objective of the XENUS interface is to uphold the XENOr Protocol's requirement for deterministic simulation. This has been achieved through a deep integration of URL-driven state initialization. By utilizing a path-based seed system, specific simulation instances can be precisely reproduced across different sessions and operational environments.

### Interface Optimization and Visual Hierarchy
The interface has been meticulously re-engineered for 100% display scaling compatibility. Key optimizations include:
- Refinement of the global header architecture to integrate real-time resource monitoring with system controls.
- Relocation of the Reproducibility Engine and mission-critical objectives into a unified tactical command column.
- Implementation of the "Midnight Gold" design system, optimizing information density without compromising scannability.

### Engine and WASM Integration
The underlying simulation engine, written in Rust and delivered via WebAssembly, has undergone significant calibration. This ensures that the deterministic logic remains performant during high-density operations, with a standardized 15-second base construction cycle that scales dynamically according to settlement metrics.

## Implementation and Deployment

### Prerequisites
- Rust (Edition 2021)
- Node.js (v18+)
- wasm-pack

### Setup Procedure
1. Build the WASM core:
   `wasm-pack build --target web --out-dir frontend/src/wasm`
2. Initialize the frontend environment:
   `cd frontend && npm install`
3. Execute the development server:
   `npm run dev`

## System Specifications
XENUS operates on a hybrid architecture, utilizing a deterministic Rust core for simulation logic and a React/TypeScript frontend for the tactical interface. This dual-layer approach ensures that all settlement data remains synchronized and reproducible according to the XENOr Protocol specifications.

---
**Technical Note**: All simulation states are strictly deterministic. State reproduction can be verified through the integrated seed-path system.
