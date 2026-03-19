import { execSync } from "node:child_process";
import { runGit, branchExists, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function convergenceCommand(
  branch: string,
  options: { noFf?: boolean; ffOnly?: boolean; squash?: boolean; abort?: boolean }
): void {
  if (options.abort) {
    runGit("merge --abort");
    console.log();
    console.log(NIXIE_BRIGHT("  ⟁ Convergence aborted"));
    console.log(MUTED("  Worldlines remain separate."));
    console.log();
    console.log(underlyingAction("git merge --abort"));
    return;
  }

  if (!branchExists(branch)) {
    console.log(NIXIE_RED(`\n  ✗ Worldline "${branch}" does not exist\n`));
    return;
  }

  const before = getRepoState();
  const beforeDiv = computeDivergence(before);

  const flags: string[] = [];
  if (options.noFf) flags.push("--no-ff");
  if (options.ffOnly) flags.push("--ff-only");
  if (options.squash) flags.push("--squash");
  const flagStr = flags.length ? " " + flags.join(" ") : "";

  try {
    execSync(`git merge${flagStr} ${branch}`, { stdio: "pipe", encoding: "utf-8" });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    const output = (err.stdout || "") + (err.stderr || "");

    if (output.includes("CONFLICT") || output.includes("fix conflicts")) {
      console.log();
      console.log(NIXIE_RED("  ⚠ Convergence conflict detected"));
      console.log(NIXIE("  Worldlines have diverged too far — manual resolution required."));
      console.log(MUTED("  Resolve conflicts, then: git commit"));
      console.log(MUTED("  Or abort with: worldline convergence --abort"));
      console.log();
      console.log(underlyingAction(`git merge${flagStr} ${branch}`));
      return;
    }

    console.log(NIXIE_RED(`\n  ✗ Convergence failed\n`));
    if (output) console.log(MUTED("  " + output.trim()));
    console.log();
    console.log(underlyingAction(`git merge${flagStr} ${branch}`));
    return;
  }

  const after = getRepoState();
  const afterDiv = computeDivergence(after);

  console.log();
  console.log(NIXIE_GREEN("  ⟁ Convergence complete"));
  console.log(NIXIE(`    ${branch} merged into ${after.branch}`));
  console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
  console.log();
  console.log(underlyingAction(`git merge${flagStr} ${branch}`));
}
