import { execSync, execFileSync } from "node:child_process";
import type { RepoState, ReflogEntry } from "./types.js";

export function runGit(args: string): string {
  try {
    return execSync(`git ${args}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

export function runGitArgs(args: string[]): string {
  try {
    return execFileSync("git", args, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

export function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --git-dir", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

function getDefaultBranch(): string {
  // Try origin HEAD
  const originHead = runGit("symbolic-ref refs/remotes/origin/HEAD");
  if (originHead) {
    return originHead.replace("refs/remotes/origin/", "");
  }
  // Try common names
  for (const name of ["main", "master"]) {
    const result = runGit(`rev-parse --verify ${name}`);
    if (result) return name;
  }
  return "HEAD";
}

export function getRepoState(): RepoState {
  const branchRaw = runGit("branch --show-current");
  const isDetached = branchRaw === "";
  const branch = isDetached ? "(detached)" : branchRaw;
  const headShort = runGit("rev-parse --short HEAD");
  const defaultBranch = getDefaultBranch();

  let mergeBaseHash = "";
  let commitsAhead = 0;
  let commitsBehind = 0;

  if (defaultBranch !== "HEAD" && headShort) {
    mergeBaseHash = runGit(`merge-base HEAD ${defaultBranch}`).slice(0, 8);
    const ahead = runGit(`rev-list --count ${defaultBranch}..HEAD`);
    const behind = runGit(`rev-list --count HEAD..${defaultBranch}`);
    commitsAhead = parseInt(ahead, 10) || 0;
    commitsBehind = parseInt(behind, 10) || 0;
  }

  const porcelain = runGit("status --porcelain");
  const dirtyFiles = porcelain ? porcelain.split("\n").filter(Boolean) : [];

  const stashList = runGit("stash list");
  const stashCount = stashList ? stashList.split("\n").filter(Boolean).length : 0;

  return {
    branch,
    headShort,
    mergeBaseHash,
    commitsAhead,
    commitsBehind,
    isDirty: dirtyFiles.length > 0,
    dirtyCount: dirtyFiles.length,
    stashCount,
    isDetached,
  };
}

export function getReflog(count = 20): ReflogEntry[] {
  const raw = runGitArgs(["reflog", "--format=%H|%gs|%cr", "-n", String(count)]);
  if (!raw) return [];

  const entries: ReflogEntry[] = [];
  for (const line of raw.split("\n")) {
    const [hash, subject, timestamp] = line.split("|");
    if (!hash || !subject) continue;

    // Parse "checkout: moving from X to Y" or "switch: moving from X to Y"
    const match = subject.match(/(?:checkout|switch): moving from (.+) to (.+)/);
    if (match) {
      entries.push({
        hash: hash.slice(0, 7),
        fromBranch: match[1],
        toBranch: match[2],
        timestamp: timestamp || "",
      });
    }
  }
  return entries;
}

export function branchExists(name: string): boolean {
  return runGit(`rev-parse --verify ${name}`) !== "";
}

export function listBranches(): string[] {
  const raw = runGit("branch --format=%(refname:short)");
  return raw ? raw.split("\n").filter(Boolean) : [];
}

export function listWorktrees(): Array<{ path: string; branch: string; head: string }> {
  const raw = runGit("worktree list --porcelain");
  if (!raw) return [];

  const worktrees: Array<{ path: string; branch: string; head: string }> = [];
  let current: { path: string; branch: string; head: string } = { path: "", branch: "", head: "" };

  for (const line of raw.split("\n")) {
    if (line.startsWith("worktree ")) {
      if (current.path) worktrees.push(current);
      current = { path: line.slice(9), branch: "", head: "" };
    } else if (line.startsWith("HEAD ")) {
      current.head = line.slice(5, 12);
    } else if (line.startsWith("branch ")) {
      current.branch = line.slice(7).replace("refs/heads/", "");
    } else if (line === "") {
      if (current.path) worktrees.push(current);
      current = { path: "", branch: "", head: "" };
    }
  }
  if (current.path) worktrees.push(current);

  return worktrees;
}
