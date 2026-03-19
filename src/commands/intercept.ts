import { execSync } from "node:child_process";
import { runGit, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function interceptCommand(
  remote: string | undefined,
  branch: string | undefined,
  options: { fetchOnly?: boolean; rebase?: boolean }
): void {
  const state = getRepoState();
  const r = remote || "origin";
  const b = branch || state.branch;
  const beforeDiv = computeDivergence(state);

  if (options.fetchOnly) {
    console.log();
    console.log(NIXIE_BRIGHT(`  ⟪ Intercepting signals from ${r}...`));

    try {
      execSync(`git fetch ${r}`, { encoding: "utf-8", stdio: "pipe" });
      console.log(NIXIE_GREEN("  ✓ Signals intercepted"));
      console.log(MUTED(`  Remote refs updated from ${r}`));
    } catch (e: unknown) {
      const err = e as { stderr?: string };
      console.log(NIXIE_RED("  ✗ Interception failed"));
      if (err.stderr) console.log(MUTED("  " + err.stderr.trim()));
    }

    console.log();
    console.log(underlyingAction(`git fetch ${r}`));
    return;
  }

  const rebaseFlag = options.rebase ? " --rebase" : "";
  const cmd = `pull${rebaseFlag} ${r} ${b}`;

  console.log();
  console.log(NIXIE_BRIGHT(`  ⟪ Intercepting from ${r}/${b}...`));

  try {
    const output = execSync(`git ${cmd}`, { encoding: "utf-8", stdio: "pipe" });

    const after = getRepoState();
    const afterDiv = computeDivergence(after);

    console.log();
    console.log(NIXIE_GREEN("  ✓ Interception complete"));
    console.log(NIXIE(`    ${r}/${b} → ${state.branch}`));
    console.log(NIXIE(`    ${beforeDiv} → ${afterDiv}`));
    if (output.trim()) console.log(MUTED("  " + output.trim()));
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    const output = (err.stdout || "") + (err.stderr || "");

    if (output.includes("CONFLICT")) {
      console.log();
      console.log(NIXIE_RED("  ⚠ Interception conflict detected"));
      console.log(NIXIE("  Incoming worldline data conflicts with local timeline."));
      console.log(MUTED("  Resolve conflicts and commit to complete."));
    } else {
      console.log();
      console.log(NIXIE_RED("  ✗ Interception failed"));
      if (output.trim()) console.log(MUTED("  " + output.trim()));
    }
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}
