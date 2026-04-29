// WASM module interface
export interface WasmGame {
  new(seed: bigint): WasmGame;
  from_string_seed(seed: string): WasmGame;
  tick(): string; // JSON GameState
  place_building(x: number, y: number, building_type: string): string;
  get_state(): string; // JSON GameState
  get_resources(): string; // JSON ResourceValues
  reset(): void;
  get_tick(): number;
  is_protocol_active(): boolean;
  free(): void;
}

export interface WasmModule {
  XenusGame: WasmGame;
}
