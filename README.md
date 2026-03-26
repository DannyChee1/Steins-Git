# steins-git

**Steins;Gate themed Git CLI.** Divergence meters, worldline shifts, D-Mails, and gel-bananas for your repo.

A Steins;Gate Git wrapper.

```
npm install -g steins-git
```

## Quick Start

```bash
worldline create                          # git init
worldline status                          # divergence meter + branch state
worldline stage -a                        # git add -A
worldline record -m "tutturu"             # git commit -m "tutturu"
worldline shift -c feature/kurisu         # git switch -c feature/kurisu
worldline transmit -u origin main         # git push -u origin main
```

## Commands

### Core Workflow
| Command | Git Equivalent | Description |
|---------|---------------|-------------|
| `worldline create` | `git init` | Create a new worldline |
| `worldline status` | `git status` | Divergence meter + branch state |
| `worldline stage <files>` | `git add` | Prepare changes for the timeline |
| `worldline record -m "msg"` | `git commit` | Record a memory to the worldline |
| `worldline diverge` | `git diff` | View divergences in the timeline |

### Worldline Navigation
| Command | Git Equivalent | Description |
|---------|---------------|-------------|
| `worldline shift <branch>` | `git switch` | Shift to another worldline |
| `worldline shift -c <branch>` | `git switch -c` | Create and shift to new worldline |
| `worldline worldlines` | `git branch` | List all worldlines |
| `worldline worldlines -d <name>` | `git branch -d` | Delete a worldline |
| `worldline worldlines -M <name>` | `git branch -M` | Force rename current worldline |
| `worldline memories` | `git log` | View worldline memories |
| `worldline memories --graph` | `git log --graph` | Divergence graph |
| `worldline steiner` | `git reflog` | Reading Steiner — timeline memory |
| `worldline inspect <ref>` | `git show` | Inspect a specific memory |
| `worldline trace <file>` | `git blame` | Trace the origin of each line |

### Timeline Manipulation
| Command | Git Equivalent | Description |
|---------|---------------|-------------|
| `worldline convergence <branch>` | `git merge` | Converge worldlines |
| `worldline rewrite <branch>` | `git rebase` | Causality rewrite |
| `worldline dmail <branch> <commit>` | `git cherry-pick` | Send a D-Mail to another worldline |
| `worldline timeleap <target>` | `git reset` | Time leap to a previous point |
| `worldline timeleap -r <file>` | `git restore` | Restore a file |
| `worldline gel push -m "msg"` | `git stash push` | Gel-banana — stash changes |
| `worldline gel pop` | `git stash pop` | Restore gel-banana |
| `worldline gel list` | `git stash list` | List gel-bananas |
| `worldline attractor <name>` | `git tag` | Attractor field checkpoint |

### Remote Operations
| Command | Git Equivalent | Description |
|---------|---------------|-------------|
| `worldline transmit` | `git push` | Transmit to remote |
| `worldline intercept` | `git pull` | Intercept remote data |
| `worldline intercept --fetch-only` | `git fetch` | Fetch only |
| `worldline observe <url>` | `git clone` | Observe remote worldline |
| `worldline satellite add <name> <url>` | `git remote add` | Add satellite link |
| `worldline satellite list` | `git remote` | List satellite links |

### Parallel Worldlines
| Command | Git Equivalent | Description |
|---------|---------------|-------------|
| `worldline phonewave` | `git worktree` | Interactive worktree management |

## Requirements

- Node.js >= 20
- Git installed and on PATH

---

*El Psy Kongroo.*
