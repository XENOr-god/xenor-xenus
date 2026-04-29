// WASM initialization for web target
// Web target requires calling __wbg_init() before using exports

let initialized = false;

export async function initializeWasm() {
  if (initialized) {
    const mod = await import("./xenor_xenus.js");
    return mod;
  }

  try {
    // Import the module (which has __wbg_init as default)
    const mod = await import("./xenor_xenus.js");

    // Call the init function to set up WASM memory and exports
    // The default export is __wbg_init which initializes the WASM module
    if (mod.default) {
      console.log("Initializing WASM via __wbg_init...");
      await mod.default();
      console.log("WASM initialized successfully");
    } else {
      console.error("__wbg_init not found in module");
    }

    initialized = true;
    return mod;
  } catch (err) {
    console.error("Failed to initialize WASM:", err);
    throw err;
  }
}

