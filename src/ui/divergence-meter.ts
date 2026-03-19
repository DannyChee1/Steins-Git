import { NIXIE, NIXIE_DIM, NIXIE_BRIGHT } from "./theme.js";

export function renderDivergenceMeter(
  divergence: string,
  branch: string,
  extra?: string[]
): string {
  const lines: string[] = [];
  const innerWidth = 38;
  const pad = (s: string, raw: number) =>
    s + " ".repeat(Math.max(0, innerWidth - raw));

  lines.push(NIXIE_DIM("  ┌" + "─".repeat(innerWidth) + "┐"));

  const divLine = `  DIVERGENCE  ▍${divergence}▐`;
  lines.push(NIXIE_DIM("  │") + NIXIE_BRIGHT(pad(divLine, divLine.length)) + NIXIE_DIM("│"));

  const branchLine = `  WORLDLINE   ▍${branch}▐`;
  lines.push(NIXIE_DIM("  │") + NIXIE(pad(branchLine, branchLine.length)) + NIXIE_DIM("│"));

  if (extra) {
    for (const line of extra) {
      const content = `  ${line}`;
      lines.push(
        NIXIE_DIM("  │") + NIXIE(pad(content, content.length)) + NIXIE_DIM("│")
      );
    }
  }

  lines.push(NIXIE_DIM("  └" + "─".repeat(innerWidth) + "┘"));

  return lines.join("\n");
}
