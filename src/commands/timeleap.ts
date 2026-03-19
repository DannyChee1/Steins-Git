import { runGit, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function timeleapCommand(
  target: string,
  options: { soft?: boolean; hard?: boolean; restore?: boolean }
): void {
  const before = getRepoState();
  const beforeDiv = computeDivergence(before);

  if (options.restore) {
    runGit(`restore ${target}`);
    console.log();
    console.log(NIXIE_GREEN("  ⏪ Time leap — file restored"));
    console.log(NIXIE(`    ${target} reverted to last committed state`));
    console.log();
    console.log(underlyingAction(`git restore ${target}`));
    return;
  }

  let mode = "--mixed";
  let modeLabel = "mixed";
  if (options.soft) {
    mode = "--soft";
    modeLabel = "soft";
  } else if (options.hard) {
    mode = "--hard";
    modeLabel = "hard";
  }

  if (options.hard) {
    console.log(NIXIE_RED("\n  ⚠ Hard time leap — this is destructive"));
    console.log(NIXIE_RED("  All uncommitted changes will be lost.\n"));
  }

  runGit(`reset ${mode} ${target}`);
  const after = getRepoState();
  const afterDiv = computeDivergence(after);

  console.log();
  console.log(NIXIE_GREEN("  ⏪ Time leap complete"));
  console.log(NIXIE(`    Mode: ${modeLabel}`));
  console.log(NIXIE(`    Target: ${target}`));
  console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
  console.log();
  console.log(underlyingAction(`git reset ${mode} ${target}`));
}
