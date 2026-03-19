import { runGitArgs } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function inspectCommand(ref: string, options: { stat?: boolean }): void {
  const args = ["show"];
  if (options.stat) args.push("--stat");
  args.push(ref);

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(NIXIE_RED(`\n  ✗ Could not find "${ref}" in the timeline\n`));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT(`  ◈ Inspecting memory: ${ref}`));
  console.log();

  for (const line of raw.split("\n")) {
    if (line.startsWith("commit ")) {
      console.log(NIXIE_BRIGHT(`  ${line}`));
    } else if (line.startsWith("Author:") || line.startsWith("Date:")) {
      console.log(NIXIE_DIM(`  ${line}`));
    } else if (line.startsWith("+++ ") || line.startsWith("--- ")) {
      console.log(NIXIE_BRIGHT(`  ${line}`));
    } else if (line.startsWith("+")) {
      console.log(NIXIE_GREEN(`  ${line}`));
    } else if (line.startsWith("-")) {
      console.log(NIXIE_RED(`  ${line}`));
    } else if (line.startsWith("@@")) {
      console.log(NIXIE_DIM(`  ${line}`));
    } else if (line.startsWith("diff ")) {
      console.log(NIXIE_BRIGHT(`  ${line}`));
    } else {
      console.log(NIXIE(`  ${line}`));
    }
  }

  console.log();
  console.log(underlyingAction(`git show${options.stat ? " --stat" : ""} ${ref}`));
}
