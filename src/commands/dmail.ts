import { execSync } from "node:child_process";
import { runGit, branchExists, getRepoState } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, MUTED, underlyingAction } from "../ui/theme.js";

export function dmailCommand(targetBranch: string, commit: string): void {
  // Validate target branch
  if (!branchExists(targetBranch)) {
    console.log(NIXIE_RED(`  ✗ Target worldline "${targetBranch}" does not exist`));
    return;
  }

  // Validate commit
  const commitHash = runGit(`rev-parse --verify ${commit}`);
  if (!commitHash) {
    console.log(NIXIE_RED(`  ✗ Commit "${commit}" not found`));
    return;
  }

  const commitSubject = runGit(`log -1 --format=%s ${commit}`);
  const originalBranch = getRepoState().branch;

  if (originalBranch === targetBranch) {
    console.log(NIXIE_RED("  ✗ Cannot send D-Mail to the current worldline"));
    return;
  }

  // Stash if dirty
  const state = getRepoState();
  const wasDirty = state.isDirty;
  if (wasDirty) {
    console.log(MUTED("  Stashing current changes..."));
    runGit("stash push -m 'worldline-dmail-autostash'");
  }

  // Switch, cherry-pick, switch back
  try {
    execSync(`git switch ${targetBranch}`, { stdio: "pipe" });

    try {
      execSync(`git cherry-pick ${commitHash}`, { stdio: "pipe" });
    } catch {
      console.log(NIXIE_RED("  ✗ D-Mail failed — conflict detected"));
      console.log(NIXIE("  Aborting and returning to original worldline..."));
      runGit("cherry-pick --abort");
      execSync(`git switch ${originalBranch}`, { stdio: "pipe" });
      if (wasDirty) runGit("stash pop");
      return;
    }

    execSync(`git switch ${originalBranch}`, { stdio: "pipe" });
  } catch {
    console.log(NIXIE_RED("  ✗ Worldline switch failed during D-Mail"));
    // Try to recover
    runGit(`switch ${originalBranch}`);
    if (wasDirty) runGit("stash pop");
    return;
  }

  if (wasDirty) {
    runGit("stash pop");
  }

  const shortHash = commitHash.slice(0, 7);
  console.log();
  console.log(NIXIE_BRIGHT("  ✉ D-Mail sent successfully"));
  console.log(NIXIE(`    Commit ${shortHash} → ${targetBranch}`));
  console.log(MUTED(`    "${commitSubject}"`));
  console.log();
  console.log(underlyingAction(`git cherry-pick ${shortHash} onto ${targetBranch}`));
}
