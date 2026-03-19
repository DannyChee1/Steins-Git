import { execSync } from "node:child_process";
import { getRepoState } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function transmitCommand(
  remote: string | undefined,
  branch: string | undefined,
  options: { force?: boolean; setUpstream?: boolean; tags?: boolean }
): void {
  const state = getRepoState();
  const r = remote || "origin";
  const b = branch || state.branch;

  const flags: string[] = [];
  if (options.force) flags.push("--force");
  if (options.setUpstream) flags.push("-u");
  if (options.tags) flags.push("--tags");
  const flagStr = flags.length ? " " + flags.join(" ") : "";

  const cmd = `push${flagStr} ${r} ${b}`;

  console.log();
  console.log(NIXIE_BRIGHT(`  ⟫ Transmitting to ${r}/${b}...`));

  if (options.force) {
    console.log(NIXIE_RED("  ⚠ Force transmit — remote history will be overwritten"));
  }

  try {
    const output = execSync(`git ${cmd}`, { encoding: "utf-8", stdio: "pipe" });
    console.log();
    console.log(NIXIE_GREEN("  ✓ Transmission complete"));
    console.log(NIXIE(`    ${state.branch} → ${r}/${b}`));
    if (output.trim()) console.log(MUTED("  " + output.trim()));
  } catch (e: unknown) {
    const err = e as { stderr?: string };
    console.log();
    console.log(NIXIE_RED("  ✗ Transmission failed"));
    if (err.stderr) console.log(MUTED("  " + err.stderr.trim()));
    console.log(MUTED("  Try: worldline intercept first, or use --force"));
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}
