import { runGit, runGitArgs, getRepoState } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function worldlinesListCommand(
  options: { all?: boolean; remote?: boolean; merged?: boolean }
): void {
  const args = ["branch"];
  if (options.all) args.push("-a");
  if (options.remote) args.push("-r");
  if (options.merged) args.push("--merged");
  args.push("--format=%(refname:short)|%(HEAD)|%(upstream:short)|%(creatordate:relative)");

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(MUTED("\n  No worldlines found.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ⟁ Active Worldlines"));
  if (options.merged) console.log(MUTED("    (showing only merged worldlines)"));
  console.log();

  for (const line of raw.split("\n").filter(Boolean)) {
    const [name, head, upstream, date] = line.split("|");
    const isCurrent = head === "*";
    const prefix = isCurrent ? NIXIE_GREEN("  ● ") : NIXIE_DIM("  ○ ");
    const nameStr = isCurrent ? NIXIE_BRIGHT(name) : NIXIE(name);
    const tracking = upstream ? NIXIE_DIM(` → ${upstream}`) : "";
    const dateStr = date ? MUTED(` (${date})`) : "";

    console.log(prefix + nameStr + tracking + dateStr);
  }

  console.log();
  const flagDesc = options.all ? " -a" : options.remote ? " -r" : "";
  console.log(underlyingAction(`git branch${flagDesc}`));
}

export function worldlinesDeleteCommand(name: string): void {
  const state = getRepoState();
  if (state.branch === name) {
    console.log(NIXIE_RED(`\n  ✗ Cannot collapse the current worldline "${name}"`));
    console.log(MUTED("  Shift to another worldline first.\n"));
    return;
  }

  const result = runGit(`branch -d ${name}`);
  if (result) {
    console.log();
    console.log(NIXIE_GREEN(`  ✓ Worldline "${name}" collapsed`));
    console.log();
    console.log(underlyingAction(`git branch -d ${name}`));
    return;
  }

  console.log();
  console.log(NIXIE_RED(`  ⚠ Worldline "${name}" has unmerged changes`));
  console.log(MUTED("  If you're sure, delete it with: worldline worldlines -D " + name));
  console.log();
  console.log(underlyingAction(`git branch -d ${name}`));
}

export function worldlinesForceDeleteCommand(name: string): void {
  const state = getRepoState();
  if (state.branch === name) {
    console.log(NIXIE_RED(`\n  ✗ Cannot collapse the current worldline "${name}"`));
    console.log(MUTED("  Shift to another worldline first.\n"));
    return;
  }

  runGit(`branch -D ${name}`);
  console.log();
  console.log(NIXIE_GREEN(`  ✓ Worldline "${name}" force-collapsed`));
  console.log();
  console.log(underlyingAction(`git branch -D ${name}`));
}

export function worldlinesRenameCommand(name: string): void {
  const state = getRepoState();
  runGit(`branch -m ${name}`);

  const after = getRepoState();
  if (after.branch === name) {
    console.log();
    console.log(NIXIE_GREEN(`  ✓ Worldline renamed`));
    console.log(NIXIE(`    ${state.branch} → ${name}`));
    console.log();
    console.log(underlyingAction(`git branch -m ${name}`));
  } else {
    console.log(NIXIE_RED(`\n  ✗ Failed to rename worldline\n`));
  }
}

export function worldlinesForceRenameCommand(name: string): void {
  const state = getRepoState();
  runGit(`branch -M ${name}`);

  const after = getRepoState();
  if (after.branch === name) {
    console.log();
    console.log(NIXIE_GREEN(`  ✓ Worldline force-renamed`));
    console.log(NIXIE(`    ${state.branch} → ${name}`));
    console.log();
    console.log(underlyingAction(`git branch -M ${name}`));
  } else {
    console.log(NIXIE_RED(`\n  ✗ Failed to rename worldline\n`));
  }
}
