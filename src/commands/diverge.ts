import { runGit, runGitArgs } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function divergeCommand(
  paths: string[],
  options: { staged?: boolean; stat?: boolean; branch?: string }
): void {
  // Diff between branches
  if (options.branch) {
    branchDiff(options.branch, options.stat);
    return;
  }

  // Staged diff
  if (options.staged) {
    stagedDiff(paths, options.stat);
    return;
  }

  // Working tree diff
  workingDiff(paths, options.stat);
}

function workingDiff(paths: string[], stat?: boolean): void {
  const args = ["diff"];
  if (stat) args.push("--stat");
  args.push(...paths);

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(MUTED("\n  No divergences in working tree.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ◇ Working Tree Divergences"));
  console.log();
  renderDiff(raw, stat);
  console.log();
  console.log(underlyingAction(`git diff${stat ? " --stat" : ""} ${paths.join(" ")}`.trim()));
}

function stagedDiff(paths: string[], stat?: boolean): void {
  const args = ["diff", "--cached"];
  if (stat) args.push("--stat");
  args.push(...paths);

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(MUTED("\n  No staged divergences.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ◇ Staged Divergences (prepared for timeline)"));
  console.log();
  renderDiff(raw, stat);
  console.log();
  console.log(underlyingAction(`git diff --cached${stat ? " --stat" : ""} ${paths.join(" ")}`.trim()));
}

function branchDiff(branch: string, stat?: boolean): void {
  const args = ["diff", branch];
  if (stat) args.push("--stat");

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(MUTED(`\n  No divergences from ${branch}.\n`));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT(`  ◇ Divergences from worldline "${branch}"`));
  console.log();
  renderDiff(raw, stat);
  console.log();
  console.log(underlyingAction(`git diff ${branch}${stat ? " --stat" : ""}`));
}

function renderDiff(raw: string, stat?: boolean): void {
  if (stat) {
    for (const line of raw.split("\n").filter(Boolean)) {
      console.log(NIXIE_DIM(`  ${line}`));
    }
    return;
  }

  for (const line of raw.split("\n")) {
    if (line.startsWith("+++ ") || line.startsWith("--- ")) {
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
      console.log(MUTED(`  ${line}`));
    }
  }
}
