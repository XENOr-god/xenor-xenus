import React, { useState } from "react";
import "../styles/SeedInput.css";

interface SeedInputProps {
  onSubmit: (seed: string) => void;
  disabled?: boolean;
}

/**
 * Seed input with terminal aesthetic
 * Blinking cursor, typewriter effect
 */
export const SeedInput: React.FC<SeedInputProps> = ({ onSubmit, disabled }) => {
  const [seed, setSeed] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (seed.trim()) {
      setSubmitted(true);
      onSubmit(seed);
      // Auto-reset after 2 seconds for next input
      setTimeout(() => {
        setSeed("");
        setSubmitted(false);
      }, 2000);
    }
  };

  return (
    <form className="seed-input-container" onSubmit={handleSubmit}>
      <div className="seed-label">
        <span className="label-text">// ENTER SEED</span>
        {!submitted && <span className="terminal-cursor" />}
      </div>

      <div className="seed-input-wrapper">
        <input
          type="text"
          className="seed-input"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="xenus_settlement"
          disabled={disabled || submitted}
          autoFocus
        />
        {!submitted && <span className="input-cursor" />}
      </div>

      <button
        className="seed-submit"
        type="submit"
        disabled={disabled || submitted || !seed.trim()}
      >
        {submitted ? "GENERATING..." : "GENERATE [ENTER]"}
      </button>

      {submitted && (
        <div className="seed-status">
          <span className="status-dot" />
          SEED LOADED: {seed.toUpperCase()}
        </div>
      )}
    </form>
  );
};
