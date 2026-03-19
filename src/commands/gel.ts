import { runGit, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function gelPushCommand(options: { message?: string }): void {
  const msg = options.message ? ` -m "${options.message}"` : "";
  const state = getRepoState();

  if (!state.isDirty) {
    console.log(MUTED("\n  No changes to gel-ify. Working tree is clean.\n"));
    return;
  }

  runGit(`stash push${msg}`);

  const afterState = getRepoState();
  if (!afterState.isDirty || afterState.dirtyCount < state.dirtyCount) {
    console.log();
    console.log(NIXIE_GREEN("  Changes gel-ified"));
    console.log(NIXIE(`    ${state.dirtyCount} file${state.dirtyCount !== 1 ? "s" : ""} preserved between worldlines`));
    if (options.message) console.log(MUTED(`    "${options.message}"`));
    console.log();
    console.log(underlyingAction(`git stash push${msg}`));
  } else {
    console.log(NIXIE_RED("\n  ✗ Failed to gel-ify changes\n"));
  }
}

export function gelPopCommand(): void {
  const before = getRepoState();
  const beforeDiv = computeDivergence(before);

  const result = runGit("stash pop");
  if (result.includes("error") || result.includes("CONFLICT")) {
    if (result.includes("CONFLICT")) {
      console.log();
      console.log(NIXIE_RED("  ⚠ Gel-banana restoration conflict"));
      console.log(MUTED("  Resolve conflicts to complete restoration."));
    } else {
      console.log(NIXIE_RED("\n  ✗ No gel-bananas to restore\n"));
    }
    console.log();
    console.log(underlyingAction("git stash pop"));
    return;
  }

  const after = getRepoState();
  const afterDiv = computeDivergence(after);

  console.log();
  console.log(NIXIE_GREEN("  Gel-banana restored"));
  console.log(NIXIE(`    Changes re-applied to worldline`));
  console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
  console.log();
  console.log(underlyingAction("git stash pop"));
}

export function gelApplyCommand(ref?: string): void {
  const target = ref || "stash@{0}";
  runGit(`stash apply ${target}`);
  console.log();
  console.log(NIXIE_GREEN(`  Gel-banana applied (kept in storage)`));
  console.log(NIXIE(`    Applied: ${target}`));
  console.log();
  console.log(underlyingAction(`git stash apply ${target}`));
}

export function gelDropCommand(ref?: string): void {
  const target = ref || "stash@{0}";
  runGit(`stash drop ${target}`);
  console.log();
  console.log(NIXIE_GREEN(`  ✓ Gel-banana discarded`));
  console.log(NIXIE(`    Dropped: ${target}`));
  console.log();
  console.log(underlyingAction(`git stash drop ${target}`));
}

export function gelListCommand(): void {
  const raw = runGit("stash list");
  if (!raw) {
    console.log(MUTED("\n  No gel-bananas in storage.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  Gel-Banana Storage"));
  console.log();

  for (const line of raw.split("\n").filter(Boolean)) {
    const match = line.match(/^(stash@\{\d+\}):\s*(.*)/);
    if (match) {
      console.log(NIXIE_DIM(`    ${match[1]}`) + NIXIE(` ${match[2]}`));
    } else {
      console.log(NIXIE(`    ${line}`));
    }
  }

  console.log();
  console.log(underlyingAction("git stash list"));
}
