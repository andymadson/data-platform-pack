# Claude Code Plugins: Field Cheat Sheet

One package, versioned, installed in one command, governed by the platform team. That's a plugin.

## The anatomy

```
marketplace repo (platform team owns this)
├── .claude-plugin/marketplace.json      # catalog: name, owner, plugin list
└── plugins/data-platform-pack/
    ├── .claude-plugin/plugin.json       # manifest: name (required), version
    ├── skills/<name>/SKILL.md           # /plugin-name:skill, or model-invoked
    ├── agents/<name>.md                 # subagents with scoped tools
    ├── hooks/hooks.json                 # deterministic lifecycle handlers
    └── scripts/                         # anything the hooks run
```

Diagram: enablement/assets/anatomy.svg (slide 3 of the deck).

Only `plugin.json` lives in `.claude-plugin/`. Every component sits at the plugin root. Everything is namespaced by plugin name.

## The commands that matter

```
/plugin marketplace add owner/repo        # or a local path while testing
/plugin install data-platform-pack@platform-tools
/plugin                                   # see what's installed and enabled
/plugin marketplace update platform-tools # pull catalog and version changes
claude --plugin-dir ./plugins/<name>      # dev loop: load in place, one session
claude plugin validate .                  # lint the marketplace or a plugin
node tests/run_tests.js                   # this kit's offline harness, zero tokens
node tests/try.js "<command>"             # one-shot policy check: allow / ask / deny
```

Installed plugins run from a cache copy pinned by version. Editing your checkout changes nothing until you bump `version` in `plugin.json` and engineers update. That's a feature: releases, not drift.

## The 4-beat demo (prompts in PROMPTS.md)

1. **Install.** Marketplace add, install, restart. Show the components arriving.
2. **Use.** `/data-platform-pack:sql-review pipelines/sql/orders_daily.sql` catches 4 seeded findings against the team's written conventions.
3. **Govern.** Ask Claude to drop a prod table. The hook denies it, every time, because it's a regex in a process gate, not a prompt. Show `.claude/audit/*.jsonl`: denials next to executions.
4. **Ship.** Add the customer's rule to `policy.json`, harness-verify offline, bump to 1.0.1, narrate the fleet update. One PR governs every engineer's agent.

## Hook decisions in one breath

PreToolUse hooks read the tool call as JSON on stdin and answer `allow`, `deny` (blocks, tells Claude why), or `ask` (routes to the human). Deny beats ask beats allow. Because hooks are processes, you test them in CI by piping JSON at them.

## Discovery questions for the field

- Who owns developer tooling standards, and how do they ship a change to every engineer today?
- What's your audit story when an AI agent touches this codebase?
- What's the one command an agent should never run here? (Then ship it as a rule in beat 4.)

## Objections, short form

- **"We'll just copy `.claude/` folders."** That's drift with extra steps. Plugins add versions, namespacing, distribution, and a review point.
- **"The model could ignore it."** It can ignore instructions. It can't ignore a process gate. Read `guard.js`; it's 158 lines on purpose.
- **"Supply chain risk."** Right instinct. Internal marketplace, PR review, version pins, managed-settings allowlists. Treat it like your package registry.

Docs: code.claude.com/docs/en/plugins and code.claude.com/docs/en/plugin-marketplaces
