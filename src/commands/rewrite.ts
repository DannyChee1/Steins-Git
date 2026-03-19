import { execSync } from "node:child_process";
import { runGit, branchExists, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function rewriteCommand(
  branch: string,
  options: { onto?: string; abort?: boolean; continue?: boolean }
): void {
  if (options.abort) {
    runGit("rebase --abort");
    console.log();
    console.log(NIXIE_BRIGHT("  ⟁ Causality rewrite aborted"));
    console.log(MUTED("  Timeline restored to original state."));
    console.log();
    console.log(underlyingAction("git rebase --abort"));
    return;
  }

  if (options.continue) {
    try {
      execSync("git rebase --continue", { stdio: "pipe", encoding: "utf-8" });
      const after = getRepoState();
      const afterDiv = computeDivergence(after);
      console.log();
      console.log(NIXIE_GREEN("  ⟁ Causality rewrite continued"));
      console.log(NIXIE(`    Divergence: ${afterDiv}`));
      console.log();
      console.log(underlyingAction("git rebase --continue"));
    } catch {
      console.log(NIXIE_RED("\n  ✗ Cannot continue — resolve remaining conflicts first\n"));
    }
    return;
  }

  if (!branchExists(branch)) {
    console.log(NIXIE_RED(`\n  ✗ Worldline "${branch}" does not exist\n`));
    return;
  }

  const before = getRepoState();
  const beforeDiv = computeDivergence(before);

  const ontoFlag = options.onto ? ` --onto ${options.onto}` : "";
  const cmd = `rebase${ontoFlag} ${branch}`;

  try {
    execSync(`git ${cmd}`, { stdio: "pipe", encoding: "utf-8" });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    const output = (err.stdout || "") + (err.stderr || "");

    if (output.includes("CONFLICT") || output.includes("fix conflicts")) {
      console.log();
      console.log(NIXIE_RED("  ⚠ Causality conflict detected"));
      console.log(NIXIE("  Timeline rewrite hit a paradox — manual resolution required."));
      console.log(MUTED("  Resolve conflicts, then: worldline rewrite --continue"));
      console.log(MUTED("  Or abort with: worldline rewrite --abort"));
      console.log();
      console.log(underlyingAction(`git ${cmd}`));
      return;
    }

    console.log(NIXIE_RED("\n  ✗ Causality rewrite failed\n"));
    if (output) console.log(MUTED("  " + output.trim()));
    console.log();
    console.log(underlyingAction(`git ${cmd}`));
    return;
  }

  const after = getRepoState();
  const afterDiv = computeDivergence(after);

  console.log();
  console.log(NIXIE_GREEN("  ⟁ Causality rewrite complete"));
  console.log(NIXIE(`    Timeline rewritten onto ${branch}`));
  console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}
