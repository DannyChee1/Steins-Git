import { getReflog, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_DIM, MUTED } from "../ui/theme.js";
import { underlyingAction } from "../ui/theme.js";

export function steinerCommand(options: { count?: string }): void {
  const count = parseInt(options.count || "20", 10);
  const entries = getReflog(count);
  const state = getRepoState();
  const currentDiv = computeDivergence(state);

  console.log();
  console.log(NIXIE_BRIGHT("  ┃ Reading Steiner — Timeline Memory"));
  console.log(NIXIE_DIM("  ┃"));

  // Current position
  console.log(
    NIXIE_BRIGHT("  ●") +
      NIXIE(` HEAD  ${state.branch}`) +
      NIXIE_DIM(`  ${currentDiv}`)
  );

  if (entries.length === 0) {
    console.log(NIXIE_DIM("  │"));
    console.log(MUTED("  No worldline shifts recorded yet."));
  } else {
    for (const entry of entries) {
      console.log(NIXIE_DIM("  │"));
      console.log(
        NIXIE_DIM("  ○") +
          MUTED(` ${entry.timestamp}`) +
          NIXIE(`  ${entry.fromBranch} → ${entry.toBranch}`) +
          NIXIE_DIM(`  ${entry.hash}`)
      );
    }
  }

  console.log();
  console.log(underlyingAction("git reflog"));
}
