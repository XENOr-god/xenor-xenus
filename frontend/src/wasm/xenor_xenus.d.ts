/* tslint:disable */
/* eslint-disable */

/**
 * WASM wrapper for the XENUS_SETTLEMENT game
 */
export class XenusGame {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Initialize game with a text seed (hashed to u64)
     */
    static from_string_seed(seed_str: string): XenusGame;
    /**
     * Get current resource values
     */
    get_resources(): string;
    /**
     * Get current game state as JSON
     */
    get_state(): string;
    /**
     * Get current tick count
     */
    get_tick(): bigint;
    /**
     * Get protocol status
     */
    is_protocol_active(): boolean;
    /**
     * Initialize game with a u64 seed
     */
    constructor(seed: bigint);
    /**
     * Place a building at grid position (x, y)
     */
    place_building(x: number, y: number, building_type: string): string;
    /**
     * Reset to initial state (seed-driven replay)
     */
    reset(): void;
    /**
     * Execute one cycle of phases and return updated state as JSON
     */
    tick(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_xenusgame_free: (a: number, b: number) => void;
    readonly xenusgame_from_string_seed: (a: number, b: number) => number;
    readonly xenusgame_get_resources: (a: number, b: number) => void;
    readonly xenusgame_get_state: (a: number, b: number) => void;
    readonly xenusgame_get_tick: (a: number) => bigint;
    readonly xenusgame_is_protocol_active: (a: number) => number;
    readonly xenusgame_new: (a: bigint) => number;
    readonly xenusgame_place_building: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly xenusgame_reset: (a: number) => void;
    readonly xenusgame_tick: (a: number, b: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
