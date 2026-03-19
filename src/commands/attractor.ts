import { runGit, runGitArgs } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function attractorCommand(
  name: string | undefined,
  options: { list?: boolean; delete?: string; message?: string }
): void {
  if (options.list || !name) {
    listAttractors();
    return;
  }

  if (options.delete) {
    const result = runGit(`tag -d ${options.delete}`);
    if (result) {
      console.log();
      console.log(NIXIE_GREEN(`  ✓ Attractor field checkpoint "${options.delete}" removed`));
      console.log();
      console.log(underlyingAction(`git tag -d ${options.delete}`));
    } else {
      console.log(NIXIE_RED(`\n  ✗ Checkpoint "${options.delete}" not found\n`));
    }
    return;
  }

  const msgFlag = options.message ? ` -a -m "${options.message}"` : "";
  const existing = runGit(`tag -l ${name}`);
  if (existing) {
    console.log(NIXIE_RED(`\n  ✗ Attractor field checkpoint "${name}" already exists\n`));
    return;
  }

  runGit(`tag${msgFlag} ${name}`);

  const verify = runGit(`tag -l ${name}`);
  if (verify) {
    const headShort = runGit("rev-parse --short HEAD");
    console.log();
    console.log(NIXIE_GREEN("  ✦ Attractor field checkpoint set"));
    console.log(NIXIE(`    Name: ${name}`));
    console.log(NIXIE(`    At:   ${headShort}`));
    if (options.message) {
      console.log(MUTED(`    "${options.message}"`));
    }
    console.log();
    console.log(underlyingAction(`git tag${msgFlag} ${name}`));
  } else {
    console.log(NIXIE_RED(`\n  ✗ Failed to create checkpoint\n`));
  }
}

function listAttractors(): void {
  const raw = runGitArgs(["tag", "-l", "--sort=-creatordate", "--format=%(refname:short)|%(creatordate:relative)|%(subject)"]);
  if (!raw) {
    console.log(MUTED("\n  No attractor field checkpoints found.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  ✦ Attractor Field Checkpoints"));
  console.log();

  for (const line of raw.split("\n").filter(Boolean)) {
    const [tag, date, subject] = line.split("|");
    console.log(NIXIE(`    ✦ ${tag}`) + NIXIE_DIM(`  ${date || ""}`));
    if (subject) {
      console.log(MUTED(`      ${subject}`));
    }
  }

  console.log();
  console.log(underlyingAction("git tag -l"));
}
