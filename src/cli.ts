import { Command } from "commander";
import { isGitRepo } from "./core/git.js";
import { renderBanner } from "./ui/banner.js";
import { NIXIE_RED } from "./ui/theme.js";
import { statusCommand } from "./commands/status.js";
import { shiftCommand } from "./commands/shift.js";
import { steinerCommand } from "./commands/steiner.js";
import { dmailCommand } from "./commands/dmail.js";
import { phonewaveCommand } from "./commands/phonewave.js";
import { convergenceCommand } from "./commands/convergence.js";
import { rewriteCommand } from "./commands/rewrite.js";
import { attractorCommand } from "./commands/attractor.js";
import { timeleapCommand } from "./commands/timeleap.js";
import { transmitCommand } from "./commands/transmit.js";
import { interceptCommand } from "./commands/intercept.js";
import { observeCommand } from "./commands/observe.js";
import {
  satelliteAddCommand,
  satelliteRemoveCommand,
  satelliteRenameCommand,
  satelliteListCommand,
} from "./commands/satellite.js";
import { memoriesCommand } from "./commands/memories.js";
import {
  gelPushCommand,
  gelPopCommand,
  gelApplyCommand,
  gelDropCommand,
  gelListCommand,
} from "./commands/gel.js";
import { createCommand } from "./commands/create.js";
import { stageCommand } from "./commands/stage.js";
import { recordCommand } from "./commands/record.js";
import { divergeCommand } from "./commands/diverge.js";
import {
  worldlinesListCommand,
  worldlinesDeleteCommand,
  worldlinesForceDeleteCommand,
  worldlinesRenameCommand,
  worldlinesForceRenameCommand,
} from "./commands/worldlines.js";
import { inspectCommand } from "./commands/inspect.js";
import { traceCommand } from "./commands/trace.js";

const program = new Command();

program
  .name("worldline")
  .description("Steins;Git — a Steins;Gate themed Git interface")
  .version("0.1.0")
  .addHelpText("beforeAll", renderBanner() + "\n");

// Guard: must be in a git repo (except create/observe which work anywhere)
const noRepoCommands = new Set(["create", "observe", "help"]);
function requireGitRepo(command: Command): void {
  // Walk up the command chain to check if any ancestor is exempt
  let cmd: Command | null = command;
  while (cmd) {
    if (noRepoCommands.has(cmd.name())) return;
    cmd = cmd.parent;
  }
  if (!isGitRepo()) {
    console.log(NIXIE_RED("\n  ✗ Not inside a Git repository."));
    console.log(NIXIE_RED("  The Phone Microwave requires a valid worldline (git repo) to operate.\n"));
    process.exit(1);
  }
}
program.hook("preAction", (thisCommand, actionCommand) => {
  requireGitRepo(actionCommand);
});

// === Setup ===

program
  .command("create [directory]")
  .description("Create a new worldline (init a repository)")
  .option("--bare", "Create a bare repository")
  .action(createCommand);

// === Core Workflow ===

program
  .command("status")
  .description("Display divergence meter and worldline state")
  .action(statusCommand);

program
  .command("stage [files...]")
  .description("Prepare changes for the timeline (stage files)")
  .option("-a, --all", "Stage all changes")
  .option("-p, --patch", "Interactive partial staging")
  .option("-u, --unstage", "Unstage files")
  .action(stageCommand);

program
  .command("record")
  .description("Record a memory to the worldline (commit)")
  .option("-m, --message <msg>", "Memory description")
  .option("-a, --all", "Stage and record all changes")
  .option("--amend", "Amend the previous memory")
  .option("--allow-empty", "Allow empty recording")
  .action(recordCommand);

program
  .command("diverge [paths...]")
  .description("View divergences in the timeline (diff)")
  .option("-s, --staged", "Show staged divergences")
  .option("--stat", "Show summary statistics only")
  .option("-b, --branch <branch>", "Compare with another worldline")
  .action(divergeCommand);

// === Worldline Navigation ===

program
  .command("shift <branch>")
  .description("Shift to another worldline (switch branch)")
  .option("-c, --create", "Create a new worldline")
  .action(shiftCommand);

const worldlines = program
  .command("worldlines")
  .description("List and manage worldlines (branches)")
  .option("-a, --all", "Show all worldlines including remote")
  .option("-r, --remote", "Show remote worldlines only")
  .option("-d, --delete <name>", "Collapse a worldline")
  .option("-D, --force-delete <name>", "Force collapse a worldline")
  .option("-m, --rename <name>", "Rename current worldline")
  .option("-M, --force-rename <name>", "Force rename current worldline")
  .option("--merged", "Show only merged worldlines")
  .action((options) => {
    if (options.delete) return worldlinesDeleteCommand(options.delete);
    if (options.forceDelete) return worldlinesForceDeleteCommand(options.forceDelete);
    if (options.rename) return worldlinesRenameCommand(options.rename);
    if (options.forceRename) return worldlinesForceRenameCommand(options.forceRename);
    worldlinesListCommand(options);
  });

program
  .command("steiner")
  .description("Reading Steiner — view timeline memory (reflog)")
  .option("-n, --count <number>", "Number of entries to show", "20")
  .action(steinerCommand);

program
  .command("memories")
  .description("View worldline memories (commit log)")
  .option("-n, --count <number>", "Number of entries", "15")
  .option("-1, --oneline", "Compact one-line format")
  .option("-a, --all", "Show all worldlines")
  .option("-g, --graph", "Show divergence graph")
  .action(memoriesCommand);

program
  .command("inspect <ref>")
  .description("Inspect a specific memory (show commit)")
  .option("--stat", "Show summary statistics only")
  .action(inspectCommand);

program
  .command("trace <file>")
  .description("Trace the origin of each line (blame)")
  .option("-L, --lines <range>", "Line range (e.g., 10,20)")
  .action(traceCommand);

// === Timeline Manipulation ===

program
  .command("convergence <branch>")
  .description("Converge worldlines (merge)")
  .option("--no-ff", "Force a merge commit")
  .option("--ff-only", "Only fast-forward")
  .option("--squash", "Squash commits")
  .option("--abort", "Abort in-progress convergence")
  .action(convergenceCommand);

program
  .command("rewrite <branch>")
  .description("Causality rewrite — rebase onto another worldline")
  .option("--onto <branch>", "Rebase onto specific branch")
  .option("--abort", "Abort in-progress rewrite")
  .option("--continue", "Continue after resolving conflicts")
  .action(rewriteCommand);

program
  .command("dmail <target-branch> <commit>")
  .description("Send a D-Mail — cherry-pick a commit to another worldline")
  .action(dmailCommand);

program
  .command("timeleap <target>")
  .description("Time leap — reset or restore to a previous point")
  .option("-s, --soft", "Soft reset (keep changes staged)")
  .option("-H, --hard", "Hard reset (discard all changes)")
  .option("-r, --restore", "Restore a specific file")
  .action(timeleapCommand);

// === Gel-Banana (stash) — subcommands like git stash ===

const gel = program
  .command("gel")
  .description("Gel-banana — stash changes between worldlines");

gel
  .command("push", { isDefault: true })
  .description("Gel-ify current changes (default)")
  .option("-m, --message <msg>", "Label for the gel-banana")
  .action(gelPushCommand);

gel
  .command("pop")
  .description("Restore and remove most recent gel-banana")
  .action(gelPopCommand);

gel
  .command("apply [ref]")
  .description("Apply gel-banana without removing")
  .action(gelApplyCommand);

gel
  .command("drop [ref]")
  .description("Discard a gel-banana")
  .action(gelDropCommand);

gel
  .command("list")
  .description("List all gel-bananas")
  .action(gelListCommand);

// === Attractor Fields ===

program
  .command("attractor [name]")
  .description("Attractor field checkpoint — create or list tags")
  .option("-l, --list", "List all checkpoints")
  .option("-d, --delete <name>", "Remove a checkpoint")
  .option("-m, --message <msg>", "Annotated checkpoint message")
  .action(attractorCommand);

// === Remote Operations ===

program
  .command("transmit [remote] [branch]")
  .description("Transmit worldline data to remote (push)")
  .option("-f, --force", "Force transmit (overwrite remote)")
  .option("-u, --set-upstream", "Set upstream tracking")
  .option("--tags", "Include attractor field checkpoints")
  .action(transmitCommand);

program
  .command("intercept [remote] [branch]")
  .description("Intercept remote worldline data (pull/fetch)")
  .option("--fetch-only", "Fetch only, don't merge")
  .option("--rebase", "Rebase instead of merge")
  .action(interceptCommand);

program
  .command("observe <url> [directory]")
  .description("Observe remote worldline — clone a repository")
  .option("-b, --branch <branch>", "Clone specific branch")
  .option("--depth <n>", "Shallow observation depth")
  .action(observeCommand);

// === Satellite (remote) — subcommands like git remote ===

const satellite = program
  .command("satellite")
  .description("Manage satellite links (remotes)");

satellite
  .command("list", { isDefault: true })
  .description("List satellite links (default)")
  .option("-v, --url", "Show URLs")
  .action(satelliteListCommand);

satellite
  .command("add <name> <url>")
  .description("Establish new satellite link")
  .action(satelliteAddCommand);

satellite
  .command("remove <name>")
  .description("Sever satellite link")
  .action(satelliteRemoveCommand);

satellite
  .command("rename <old-name> <new-name>")
  .description("Rename satellite link")
  .action(satelliteRenameCommand);

// === Parallel Worldlines ===

program
  .command("phonewave")
  .description("Phone Microwave — manage parallel worldlines (worktrees)")
  .action(phonewaveCommand);

program.parse();
