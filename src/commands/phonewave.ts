import { select, input, confirm } from "@inquirer/prompts";
import { resolve, dirname } from "node:path";
import { runGit, listWorktrees, listBranches } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, MUTED, underlyingAction } from "../ui/theme.js";

export async function phonewaveCommand(): Promise<void> {
  console.log();
  console.log(NIXIE_BRIGHT("  ☎ Phone Microwave (Name Subject to Change)"));
  console.log(NIXIE("  Parallel worldline management"));
  console.log();

  const worktrees = listWorktrees();

  const action = await select({
    message: "Select operation",
    choices: [
      { name: "Create new parallel worldline", value: "create" },
      { name: "List active parallel worldlines", value: "list" },
      { name: "Collapse parallel worldline", value: "remove" },
    ],
  });

  if (action === "create") {
    await createWorktree(worktrees);
  } else if (action === "list") {
    listWorktreeDisplay(worktrees);
  } else if (action === "remove") {
    await removeWorktree(worktrees);
  }
}

async function createWorktree(
  existing: Array<{ path: string; branch: string; head: string }>
): Promise<void> {
  const branches = listBranches();
  const existingBranches = new Set(existing.map((w) => w.branch));

  const branchChoice = await select({
    message: "Branch for new worldline",
    choices: [
      { name: "⊕ Create new branch", value: "__new__" },
      ...branches
        .filter((b) => !existingBranches.has(b))
        .map((b) => ({ name: b, value: b })),
    ],
  });

  let branch: string;
  if (branchChoice === "__new__") {
    branch = await input({ message: "New branch name:" });
    if (!branch.trim()) {
      console.log(NIXIE_RED("  ✗ Branch name cannot be empty"));
      return;
    }
  } else {
    branch = branchChoice;
  }

  // Default path: ../worldlines/<branch>
  const mainWorktree = existing[0]?.path || process.cwd();
  const defaultPath = resolve(dirname(mainWorktree), "worldlines", branch);

  const path = await input({
    message: "Worktree path:",
    default: defaultPath,
  });

  const createFlag = branchChoice === "__new__" ? "-b " + branch + " " : "";
  const cmd = `worktree add ${createFlag}${path} ${branchChoice === "__new__" ? "" : branch}`.trim();
  const result = runGit(cmd);

  if (result !== "" || listWorktrees().length > existing.length) {
    console.log();
    console.log(NIXIE_GREEN(`  ✓ Parallel worldline created`));
    console.log(NIXIE(`    Branch: ${branch}`));
    console.log(NIXIE(`    Path:   ${path}`));
    console.log();
    console.log(MUTED(`  To enter this worldline:`));
    console.log(NIXIE_BRIGHT(`    cd ${path}`));
  } else {
    console.log(NIXIE_RED("  ✗ Failed to create worktree"));
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}

function listWorktreeDisplay(
  worktrees: Array<{ path: string; branch: string; head: string }>
): void {
  if (worktrees.length === 0) {
    console.log(MUTED("  No parallel worldlines active."));
    return;
  }

  console.log(NIXIE_BRIGHT("  Active parallel worldlines:"));
  console.log();
  for (const wt of worktrees) {
    console.log(NIXIE(`    ▍${wt.branch || "(detached)"}▐`));
    console.log(MUTED(`      ${wt.path}  ${wt.head}`));
  }
  console.log();
  console.log(underlyingAction("git worktree list"));
}

async function removeWorktree(
  worktrees: Array<{ path: string; branch: string; head: string }>
): Promise<void> {
  // Don't offer the main worktree for removal
  const removable = worktrees.slice(1);
  if (removable.length === 0) {
    console.log(MUTED("  No parallel worldlines to collapse."));
    return;
  }

  const target = await select({
    message: "Select worldline to collapse",
    choices: removable.map((wt) => ({
      name: `${wt.branch || "(detached)"} — ${wt.path}`,
      value: wt.path,
    })),
  });

  const ok = await confirm({
    message: `Collapse worldline at ${target}?`,
    default: false,
  });

  if (!ok) {
    console.log(MUTED("  Cancelled."));
    return;
  }

  runGit(`worktree remove ${target}`);
  console.log(NIXIE_GREEN(`  ✓ Parallel worldline collapsed`));
  console.log();
  console.log(underlyingAction(`git worktree remove ${target}`));
}
