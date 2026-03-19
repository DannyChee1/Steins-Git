import { createHash } from "node:crypto";
import type { RepoState } from "./types.js";

export function computeDivergence(state: RepoState): string {
  const raw = [
    state.mergeBaseHash,
    state.commitsAhead,
    state.commitsBehind,
    state.isDirty ? 1 : 0,
    state.stashCount,
    state.isDetached ? 1 : 0,
    state.headShort,
  ].join(":");

  const hash = createHash("sha256").update(raw).digest("hex");
  const numerator = parseInt(hash.slice(0, 12), 16);
  const denominator = 16 ** 12;
  const fractional = numerator / denominator;

  // Integer part carries semantic meaning
  let integerPart: number;
  if (
    state.commitsAhead === 0 &&
    state.commitsBehind === 0 &&
    !state.isDirty
  ) {
    integerPart = 1; // Steins Gate worldline — aligned with main
  } else if (state.commitsBehind > 20) {
    integerPart = 0; // Alpha worldline — far behind, danger zone
  } else {
    integerPart = 1; // Beta worldline variant
  }

  const decimals = fractional.toFixed(6).slice(2);
  return `${integerPart}.${decimals}`;
}
