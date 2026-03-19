import { runGit, runGitArgs } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function memoriesCommand(options: {
  count?: string;
  oneline?: boolean;
  all?: boolean;
  graph?: boolean;
}): void {
  const count = parseInt(options.count || "15", 10);

  if (options.graph) {
    graphView(count, options.all);
    return;
  }

  const allFlag = options.all ? " --all" : "";

  if (options.oneline) {
    const raw = runGit(`log --oneline -n ${count}${allFlag}`);
    if (!raw) {
      console.log(MUTED("\n  No memories recorded in this worldline.\n"));
      return;
    }

    console.log();
    console.log(NIXIE_BRIGHT("  ◈ Worldline Memories"));
    console.log();

    for (const line of raw.split("\n").filter(Boolean)) {
      const [hash, ...rest] = line.split(" ");
      console.log(NIXIE_DIM(`    ${hash}`) + NIXIE(` ${rest.join(" ")}`));
    }

    console.log();
    console.log(underlyingAction(`git log --oneline -n ${count}${allFlag}`));
    return;
  }

  const args = ["log", "--format=%H|%h|%an|%cr|%s", "-n", String(count)];
  if (options.all) args.push("--all");
  const raw = runGitArgs(args);
  if (!raw) {
    console.log(MUTED("\n  No memories recorded in this worldline.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ◈ Worldline Memories"));
  console.log();

  for (const line of raw.split("\n").filter(Boolean)) {
    const [, shortHash, author, date, subject] = line.split("|");
    console.log(NIXIE_BRIGHT(`  ● ${shortHash}`) + MUTED(` ${date} — ${author}`));
    console.log(NIXIE(`    ${subject}`));
    console.log();
  }

  console.log(underlyingAction(`git log -n ${count}${allFlag}`));
}

function graphView(count: number, all?: boolean): void {
  const args = ["log", "--graph", "--oneline", "--decorate", "-n", String(count)];
  if (all) args.push("--all");
  const raw = runGitArgs(args);

  if (!raw) {
    console.log(MUTED("\n  No memories recorded in this worldline.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ◈ Worldline Divergence Graph"));
  console.log();

  for (const line of raw.split("\n")) {
    const graphMatch = line.match(/^([*|/\\ \-]+)(.*)/);
    if (graphMatch) {
      console.log(NIXIE_DIM(`  ${graphMatch[1]}`) + NIXIE(graphMatch[2]));
    } else {
      console.log(NIXIE(`  ${line}`));
    }
  }

  console.log();
  console.log(underlyingAction(`git log --graph --oneline --decorate -n ${count}`));
}
