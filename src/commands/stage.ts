import { execSync } from "node:child_process";
import { runGit } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function stageCommand(
  files: string[],
  options: { all?: boolean; patch?: boolean; unstage?: boolean }
): void {
  // Unstage mode
  if (options.unstage) {
    const targets = files.length > 0 ? files.join(" ") : ".";
    runGit(`restore --staged ${targets}`);

    console.log();
    console.log(NIXIE_GREEN("  ✓ Changes unstaged"));
    console.log(MUTED(`    Removed from timeline preparation`));
    console.log();
    console.log(underlyingAction(`git restore --staged ${targets}`));
    return;
  }

  // Stage files
  if (!options.all && files.length === 0) {
    // Show current staging state
    showStagingState();
    return;
  }

  let cmd: string;
  if (options.all) {
    cmd = "add -A";
  } else if (options.patch) {
    // Patch mode needs interactive terminal
    console.log(NIXIE_BRIGHT("  Entering interactive staging..."));
    console.log(underlyingAction(`git add -p ${files.join(" ")}`));
    try {
      execSync(`git add -p ${files.join(" ")}`, { stdio: "inherit" });
    } catch {
      // User may have quit
    }
    return;
  } else {
    cmd = `add ${files.join(" ")}`;
  }

  runGit(cmd);

  // Show what was staged
  const staged = runGit("diff --cached --stat");

  console.log();
  console.log(NIXIE_GREEN("  ✓ Changes prepared for timeline"));

  if (options.all) {
    console.log(MUTED("    All changes staged"));
  } else {
    for (const f of files) {
      console.log(NIXIE(`    + ${f}`));
    }
  }

  if (staged) {
    console.log();
    for (const line of staged.split("\n").filter(Boolean)) {
      console.log(NIXIE_DIM(`    ${line}`));
    }
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}

function showStagingState(): void {
  const staged = runGit("diff --cached --name-status");
  const unstaged = runGit("diff --name-status");
  const untracked = runGit("ls-files --others --exclude-standard");

  console.log();
  console.log(NIXIE_BRIGHT("  ◈ Timeline Preparation State"));
  console.log();

  if (staged) {
    console.log(NIXIE_GREEN("  Prepared (staged):"));
    for (const line of staged.split("\n").filter(Boolean)) {
      const [status, ...fileParts] = line.split("\t");
      const file = fileParts.join("\t");
      const label = status === "M" ? "modified" : status === "A" ? "new" : status === "D" ? "deleted" : status;
      console.log(NIXIE_GREEN(`    ${label}: ${file}`));
    }
    console.log();
  }

  if (unstaged) {
    console.log(NIXIE_RED("  Not prepared (unstaged):"));
    for (const line of unstaged.split("\n").filter(Boolean)) {
      const [status, ...fileParts] = line.split("\t");
      const file = fileParts.join("\t");
      const label = status === "M" ? "modified" : status === "D" ? "deleted" : status;
      console.log(NIXIE_RED(`    ${label}: ${file}`));
    }
    console.log();
  }

  if (untracked) {
    console.log(MUTED("  Untracked:"));
    for (const file of untracked.split("\n").filter(Boolean)) {
      console.log(MUTED(`    ${file}`));
    }
    console.log();
  }

  if (!staged && !unstaged && !untracked) {
    console.log(MUTED("  Nothing to prepare. Working tree is clean."));
    console.log();
  }

  console.log(underlyingAction("git diff --cached, git diff, git ls-files"));
}
