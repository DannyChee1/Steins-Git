import { getRepoState } from "../core/git.js";
import { computeDivergence } from "../core/divergence.js";
import { renderDivergenceMeter } from "../ui/divergence-meter.js";
import { underlyingAction, NIXIE } from "../ui/theme.js";

export function statusCommand(): void {
  const state = getRepoState();
  const divergence = computeDivergence(state);

  const extra: string[] = [];

  if (state.commitsAhead > 0 || state.commitsBehind > 0) {
    const parts: string[] = [];
    if (state.commitsAhead > 0) parts.push(`↑${state.commitsAhead} ahead`);
    if (state.commitsBehind > 0) parts.push(`↓${state.commitsBehind} behind`);
    extra.push(parts.join("  "));
  }

  if (state.isDirty) {
    extra.push(`${state.dirtyCount} unstaged change${state.dirtyCount !== 1 ? "s" : ""}`);
  }

  if (state.stashCount > 0) {
    extra.push(`${state.stashCount} stash${state.stashCount !== 1 ? "es" : ""}`);
  }

  if (state.isDetached) {
    extra.push(`⚠ Detached HEAD at ${state.headShort}`);
  }

  console.log();
  console.log(renderDivergenceMeter(divergence, state.branch, extra));
  console.log();
  console.log(underlyingAction("git status, git rev-list, git merge-base"));
}
