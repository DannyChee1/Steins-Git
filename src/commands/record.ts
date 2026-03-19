import { execSync } from "node:child_process";
import { runGit, getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function recordCommand(
  options: { message?: string; all?: boolean; amend?: boolean; allowEmpty?: boolean }
): void {
  const before = getRepoState();

  // Check if there's anything to commit
  if (!options.amend && !options.allowEmpty) {
    const staged = runGit("diff --cached --name-only");
    if (!staged && !options.all) {
      console.log();
      console.log(NIXIE_RED("  ✗ Nothing prepared for recording"));
      console.log(MUTED("  Use: worldline stage <files> to prepare changes first"));
      console.log(MUTED("  Or:  worldline record -a to stage and record all changes"));
      console.log();
      return;
    }
  }

  const flags: string[] = [];
  if (options.all) flags.push("-a");
  if (options.amend) flags.push("--amend");
  if (options.allowEmpty) flags.push("--allow-empty");

  if (!options.message && !options.amend) {
    console.log(NIXIE_RED("\n  ✗ A message is required to record a memory"));
    console.log(MUTED('  Use: worldline record -m "your message"\n'));
    return;
  }

  const flagStr = flags.length ? " " + flags.join(" ") : "";
  const msgFlag = options.message ? ` -m "${options.message.replace(/"/g, '\\"')}"` : "";
  const cmd = `commit${flagStr}${msgFlag}`;

  try {
    const output = execSync(`git ${cmd}`, { encoding: "utf-8", stdio: "pipe" });

    const after = getRepoState();
    const afterDiv = computeDivergence(after);
    const newHash = runGit("rev-parse --short HEAD");
    const subject = runGit("log -1 --format=%s");

    console.log();
    console.log(NIXIE_GREEN(`  ✓ Memory recorded to worldline`));
    console.log(NIXIE(`    ${newHash} — ${subject}`));
    console.log(NIXIE(`    Divergence: ${afterDiv}`));

    // Show file summary
    const stat = runGit("diff --stat HEAD~1..HEAD");
    if (stat) {
      console.log();
      for (const line of stat.split("\n").filter(Boolean)) {
        console.log(NIXIE_DIM(`    ${line}`));
      }
    }

    console.log();
    console.log(underlyingAction(`git ${cmd}`));
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    const output = (err.stdout || "") + (err.stderr || "");

    console.log();
    console.log(NIXIE_RED("  ✗ Failed to record memory"));
    if (output.trim()) console.log(MUTED("  " + output.trim()));
    console.log();
    console.log(underlyingAction(`git ${cmd}`));
  }
}
