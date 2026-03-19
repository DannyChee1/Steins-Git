import { execSync } from "node:child_process";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";
import { renderBanner } from "../ui/banner.js";

export function createCommand(
  directory: string | undefined,
  options: { bare?: boolean }
): void {
  const dir = directory || ".";
  const bareFlag = options.bare ? " --bare" : "";
  const cmd = `init${bareFlag} ${dir}`;

  try {
    execSync(`git ${cmd}`, { encoding: "utf-8", stdio: "pipe" });

    console.log();
    console.log(renderBanner());
    console.log();
    console.log(NIXIE_GREEN("  ✓ New worldline created"));
    console.log(NIXIE(`    Location: ${dir === "." ? process.cwd() : dir}`));
    if (options.bare) {
      console.log(MUTED("    (bare repository — no working tree)"));
    }
    console.log();
    console.log(NIXIE("  The divergence meter is set to 0.000000"));
    console.log(MUTED("  Make your first commit to begin the timeline."));
    console.log();
    console.log(underlyingAction(`git ${cmd}`));
  } catch (e: unknown) {
    const err = e as { stderr?: string };
    console.log(NIXIE_RED("\n  ✗ Failed to create worldline"));
    if (err.stderr) console.log(MUTED("  " + err.stderr.trim()));
    console.log();
  }
}
