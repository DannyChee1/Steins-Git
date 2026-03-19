import { runGitArgs } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function traceCommand(
  file: string,
  options: { lines?: string }
): void {
  const args = ["blame"];
  if (options.lines) {
    args.push(`-L${options.lines}`);
  }
  args.push("--porcelain", file);

  const raw = runGitArgs(args);
  if (!raw) {
    console.log(NIXIE_RED(`\n  ✗ Could not trace "${file}" — file not found or not tracked\n`));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT(`  ⟐ Timeline Trace: ${file}`));
  if (options.lines) console.log(MUTED(`    Lines: ${options.lines}`));
  console.log();

  // Parse porcelain blame output
  const lines = raw.split("\n");
  let currentHash = "";
  let currentAuthor = "";
  let currentDate = "";
  let lineNo = 0;

  const commits = new Map<string, { author: string; summary: string; date: string }>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Commit header line: hash origLine finalLine [numLines]
    const headerMatch = line.match(/^([0-9a-f]{40})\s+(\d+)\s+(\d+)/);
    if (headerMatch) {
      currentHash = headerMatch[1].slice(0, 7);
      lineNo = parseInt(headerMatch[3], 10);
      continue;
    }

    if (line.startsWith("author ")) {
      currentAuthor = line.slice(7);
    } else if (line.startsWith("author-time ")) {
      const ts = parseInt(line.slice(12), 10);
      const d = new Date(ts * 1000);
      currentDate = d.toISOString().split("T")[0];
    } else if (line.startsWith("summary ")) {
      const summary = line.slice(8);
      if (!commits.has(currentHash)) {
        commits.set(currentHash, { author: currentAuthor, summary, date: currentDate });
      }
    } else if (line.startsWith("\t")) {
      // Content line
      const content = line.slice(1);
      const hashStr = NIXIE_DIM(currentHash);
      const authorStr = MUTED(currentAuthor.padEnd(15).slice(0, 15));
      const lineStr = NIXIE_DIM(String(lineNo).padStart(4));
      console.log(`  ${hashStr} ${authorStr} ${lineStr}  ${NIXIE(content)}`);
    }
  }

  console.log();
  console.log(underlyingAction(`git blame${options.lines ? ` -L${options.lines}` : ""} ${file}`));
}
