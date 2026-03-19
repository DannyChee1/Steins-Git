import { runGit, getRepoState, branchExists } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, underlyingAction } from "../ui/theme.js";

export function shiftCommand(branch: string, options: { create?: boolean }): void {
  const before = getRepoState();
  const beforeDiv = computeDivergence(before);

  if (options.create) {
    const result = runGit(`switch -c ${branch}`);
    if (!result && !runGit("branch --show-current").includes(branch)) {
      console.log(NIXIE_RED(`  ✗ Failed to create worldline "${branch}"`));
      return;
    }
  } else {
    if (!branchExists(branch)) {
      console.log(NIXIE_RED(`  ✗ Worldline "${branch}" does not exist`));
      console.log(NIXIE(`  Use ${NIXIE_BRIGHT("worldline shift -c " + branch)} to create it`));
      return;
    }
    const result = runGit(`switch ${branch}`);
    if (!result && runGit("branch --show-current") !== branch) {
      console.log(NIXIE_RED(`  ✗ Failed to shift to worldline "${branch}"`));
      return;
    }
  }

  const after = getRepoState();
  const afterDiv = computeDivergence(after);

  console.log();
  console.log(NIXIE_BRIGHT("  ⟁ Worldline shift complete"));
  console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
  console.log(NIXIE(`    ${before.branch} → ${after.branch}`));
  console.log();
  console.log(underlyingAction(`git switch ${options.create ? "-c " : ""}${branch}`));
}
