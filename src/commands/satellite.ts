import { runGit } from "../core/git.js";
import { NIXIE, NIXIE_BRIGHT, NIXIE_RED, NIXIE_GREEN, NIXIE_DIM, MUTED, underlyingAction } from "../ui/theme.js";

export function satelliteAddCommand(name: string, url: string): void {
  runGit(`remote add ${name} ${url}`);
  const verify = runGit("remote").split("\n").includes(name);
  if (verify) {
    console.log();
    console.log(NIXIE_GREEN(`  ✓ Satellite link established`));
    console.log(NIXIE(`    Name: ${name}`));
    console.log(NIXIE(`    URL:  ${url}`));
    console.log();
    console.log(underlyingAction(`git remote add ${name} ${url}`));
  } else {
    console.log(NIXIE_RED("\n  ✗ Failed to establish satellite link\n"));
  }
}

export function satelliteRemoveCommand(name: string): void {
  runGit(`remote remove ${name}`);
  console.log();
  console.log(NIXIE_GREEN(`  ✓ Satellite link "${name}" severed`));
  console.log();
  console.log(underlyingAction(`git remote remove ${name}`));
}

export function satelliteRenameCommand(oldName: string, newName: string): void {
  runGit(`remote rename ${oldName} ${newName}`);
  console.log();
  console.log(NIXIE_GREEN(`  ✓ Satellite "${oldName}" renamed to "${newName}"`));
  console.log();
  console.log(underlyingAction(`git remote rename ${oldName} ${newName}`));
}

export function satelliteListCommand(options: { url?: boolean }): void {
  const cmd = options.url ? "remote -v" : "remote";
  const raw = runGit(cmd);

  if (!raw) {
    console.log(MUTED("\n  No satellite links configured.\n"));
    return;
  }

  console.log();
  console.log(NIXIE_BRIGHT("  Satellite Links"));
  console.log();

  if (options.url) {
    const seen = new Set<string>();
    for (const line of raw.split("\n").filter(Boolean)) {
      const match = line.match(/^(\S+)\s+(\S+)\s+\((\w+)\)/);
      if (match) {
        const [, name, url] = match;
        const key = `${name}|${url}`;
        if (!seen.has(key)) {
          seen.add(key);
          console.log(NIXIE(`    ${name}`) + NIXIE_DIM(` → ${url}`));
        }
      }
    }
  } else {
    for (const name of raw.split("\n").filter(Boolean)) {
      console.log(NIXIE(`    ${name}`));
    }
  }

  console.log();
  console.log(underlyingAction(`git ${cmd}`));
}
