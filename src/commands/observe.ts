import { execSync } from "node:child_process";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export function observeCommand(
  url: string,
  directory: string | undefined,
  options: { branch?: string; depth?: string }
): void {
  const flags: string[] = [];
  if (options.branch) flags.push(`-b ${options.branch}`);
  if (options.depth) flags.push(`--depth ${options.depth}`);
  const flagStr = flags.length ? " " + flags.join(" ") : "";

  const dirArg = directory ? ` ${directory}` : "";
  const cmd = `clone${flagStr} ${url}${dirArg}`;

  console.log();
  console.log(NIXIE_BRIGHT("  Observing remote worldline..."));
  console.log(NIXIE(`    Source: ${url}`));
  if (options.branch) console.log(NIXIE(`    Branch: ${options.branch}`));

  try {
    execSync(`git ${cmd}`, { encoding: "utf-8", stdio: "pipe" });

    console.log();
    console.log(NIXIE_GREEN("  ✓ Observation complete — worldline cloned"));
    if (directory) {
      console.log(NIXIE(`    Location: ${directory}`));
      console.log(MUTED(`  To enter: cd ${directory}`));
    }
  } catch (e: unknown) {
    const err = e as { stderr?: string };
    console.log();
    console.log(NIXIE_RED("  ✗ Observation failed"));
    if (err.stderr) console.log(MUTED("  " + err.stderr.trim()));
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}
