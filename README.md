# Data Platform Pack: a Claude Code Plugin Field Demo

[![plugin-tests](https://github.com/andymadson/data-platform-pack/actions/workflows/test.yml/badge.svg)](https://github.com/andymadson/data-platform-pack/actions/workflows/test.yml)

Your best engineer built great Claude Code workflows. They live on her laptop. The other 200 engineers have 200 slightly different setups, and the platform team has no way to ship a fix to all of them. That's the problem plugins solve, and this repo demos it end to end.

This repository plays the role of a customer's internal plugin marketplace. It contains one plugin (`data-platform-pack`) that bundles four things a data platform team actually standardizes:

- A `/sql-review` skill that reviews models against the team's written conventions
- A read-only `sql-reviewer` agent that does the detailed pass
- A `warehouse-conventions` skill encoding the tribal knowledge (naming, NULL handling, revenue rules)
- Two hooks: a deterministic PreToolUse guard (no prod targets, no destructive SQL, immutable migrations, no secrets) and a PostToolUse audit trail

It also contains `demo-project/`, a runnable orders ELT pipeline (SQLite, Python standard library, zero installs) with review findings seeded on purpose. Real shape, no toy `hello world`.

This repository is the working demo artifact only. The seller-facing design note, facilitator materials, handouts, deck, validation record, and Loom are submitted separately in the assignment bundle.

## First run in under 5 minutes

Prerequisites: [Claude Code](https://code.claude.com/docs) installed and authenticated, Node 18+ (Claude Code already requires it), Python 3, git. The live validation used Claude Code 2.1.170; update Claude Code first if plugin validation reports unrecognized metadata fields. Commands below are shown for macOS, Linux, and WSL. On Windows, run the demo inside WSL or Git Bash (the hook commands use shell variable substitution); the harness and `try.js` also run fine in PowerShell, and the pipeline runs there with `python` in place of `python3`.

```bash
git clone https://github.com/andymadson/data-platform-pack && cd data-platform-pack

# 1. Prove the guardrails work before spending a single token (about 5 seconds)
node tests/run_tests.js

# 2. Prove the pipeline runs
cd demo-project && python3 pipelines/run.py all --target dev

# 3. Still in demo-project/, start Claude Code and install the plugin
claude
```

Inside Claude Code:

```
/plugin marketplace add ../
/plugin install data-platform-pack@platform-tools
```

Restart when prompted, then run your first bundled workflow:

```
/data-platform-pack:sql-review pipelines/sql/orders_daily.sql
```

That's the whole loop: one marketplace add, one install, and this machine now has the same commands, conventions, and guardrails as everyone else's. (Installing from GitHub instead? `/plugin marketplace add andymadson/data-platform-pack` does the same thing for a whole org.)

## The 4-beat demo

`PROMPTS.md` has copy-paste prompts and expected outcomes for each beat:

1. **Install.** Marketplace add, plugin install, show the namespaced components arriving.
2. **Use.** `/data-platform-pack:sql-review` catches the seeded findings (`SELECT *`, NULL keys in a rollup, returns counted as revenue, no DQ check).
3. **Govern.** Ask Claude to drop a prod table. The guard denies it deterministically, Claude course-corrects to dev, and `.claude/audit/*.jsonl` shows the denial next to every executed call.
4. **Ship.** Add a policy rule the room suggests, bump the version to 1.0.1, `/plugin marketplace update platform-tools`, and every engineer gets the new rule. That's the rollout motion.

## How it works

```
<repo>/
├── .claude-plugin/marketplace.json        # the catalog: name, owner, plugin list
├── plugins/data-platform-pack/
│   ├── .claude-plugin/plugin.json         # manifest: name, version 1.0.0
│   ├── skills/
│   │   ├── sql-review/SKILL.md            # user-invoked: /data-platform-pack:sql-review
│   │   └── warehouse-conventions/SKILL.md # model-invoked tribal knowledge
│   ├── agents/sql-reviewer.md             # read-only reviewer subagent
│   ├── hooks/hooks.json                   # wires guard.js + audit.js to events
│   └── scripts/
│       ├── guard.js                       # PreToolUse policy gate
│       ├── audit.js                       # PostToolUse audit logger
│       └── policy.json                    # the rules, as reviewable config
├── demo-project/                          # runnable orders ELT pipeline
├── tests/run_tests.js                     # offline harness: 22 checks, zero tokens
└── PROMPTS.md                             # the demo script
```

The guard reads each tool call as JSON on stdin, applies `policy.json`, and answers with a permission decision: `deny` blocks the call and tells Claude why, `ask` routes it to the human. Because it's a process gate rather than a prompt instruction, the result doesn't depend on model behavior. Same input, same decision, every run. The audit logger appends one JSON line per tool call, and the guard logs every denial, so the trail shows attempts and outcomes together.

Policy lives in `policy.json` as plain config. It gets code review like everything else the platform team ships, and it travels inside the plugin, version-pinned.

## Customize it for your team in 3 steps

1. Edit `plugins/data-platform-pack/scripts/policy.json` (add a deny or ask rule) or `skills/warehouse-conventions/SKILL.md` (add a convention).
2. Prove the new rule with `node tests/try.js "<the command>"` (instant decision, zero tokens), then run `node tests/run_tests.js` to confirm nothing regressed. Add a harness case for your rule while you're there.
3. Bump `version` in `plugin.json`, push, and have engineers run `/plugin marketplace update platform-tools` followed by a plugin update.

For fast local iteration without the install cycle, load the plugin in place for one session:

```bash
claude --plugin-dir ./plugins/data-platform-pack
```

## What this is and is not

This is policy distribution with deterministic enforcement and an audit trail. It is not a sandbox, not a replacement for IAM or warehouse permissions, and not a guarantee against every creative command variant. Treat it as one layer of defense in depth: the plugin governs the agent's behavior, your infrastructure permissions govern everything else. The guard fails safe: on an internal error it escalates to the human (`ask`) instead of silently allowing.

## Troubleshooting

- **Skills or hooks not showing after install:** restart Claude Code, or run `/reload-plugins`. Hook and agent changes don't hot-reload mid-session.
- **Policy edits not taking effect:** installed plugins run from a cache copy, not your checkout. Bump the version and update, or iterate with `claude --plugin-dir ./plugins/data-platform-pack`.
- **Validate manifests:** `claude plugin validate .` for the marketplace, `claude plugin validate ./plugins/data-platform-pack` for the plugin.
- **Windows:** the hook commands use `${CLAUDE_PLUGIN_ROOT}` shell substitution; run Claude Code under WSL or Git Bash.
- **Check any command against policy:** `node tests/try.js "<command>"` or `node tests/try.js --write <file> "<content>"`. Exit codes: 0 allow, 1 ask, 2 deny.
- **Audit log location:** `<project>/.claude/audit/agent-audit-YYYY-MM-DD.jsonl` (gitignored).

Docs: [Plugins](https://code.claude.com/docs/en/plugins), [Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
