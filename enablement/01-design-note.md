# Design Note: Plugins Enablement Kit

**Capability chosen:** Plugins. Subagents and hooks are features. Plugins are the rollout story. They're also the capstone concept: a plugin is the package that bundles everything else (skills, agents, hooks, MCP servers) into one versioned, installable unit. Enterprises don't stall POCs because the demo wasn't impressive. They stall on "how do we give this to 200 engineers consistently, with our policies attached?" Plugins are the answer to the question that actually blocks deals.

## Learning objectives

After 30 minutes with this kit, an Applied AI engineer can:

1. Draw plugin anatomy from memory: a marketplace catalog pointing at plugins, each plugin a manifest plus skills, agents, and hooks, distributed through git and pinned by version.
2. Run the 4-beat demo solo from a fresh clone (install, use, govern, ship) in under 12 minutes.
3. Ship a customer-specific change live: add one policy rule or convention, verify it offline in seconds, bump the version, and walk through the fleet-wide update motion.
4. Handle the three objections that always come up: "why not just copy `.claude/` folders around," "what if the model ignores instructions," and "who reviews third-party plugin code."

## How I scoped it

**Made the cut:** one plugin with four component types (two skills, one agent, two hooks), one marketplace, a runnable data pipeline shaped like a real customer repo, a deterministic guardrail beat, and a 22-check offline test harness that costs zero tokens. The harness matters more than it looks: it's the seller's pre-call confidence check and the proof that hooks are just processes you can test in CI.

**Cut, deliberately:** MCP and LSP servers in the plugin (auth variability is how live demos die; they get one sentence, not a beat), multi-plugin marketplaces and dependency constraints (day-two concerns), building a plugin from scratch live (scaffolding is boring to watch), and a heavy deck. The deck carries only the first eight minutes of framing; the demo itself never leaves the terminal, and a one-page handout covers the rest.

The demo domain is data engineering (an ELT pipeline with a prod target and immutable migrations) because that's where enterprise anxiety about agents is most concrete, and because SQLite plus the Python standard library means zero installs and nothing to break on stage.

The room deck tells the story through a named engineer, Maya. The name is a stand-in: presenters should swap in a real engineer or a real anecdote from the account when they have one, and the arc holds either way. The deck's speaker notes mark every slide where the name appears.

## Why this is the right field demo

Three reasons. First, it sells to two buyers at once: the engineer sees `/sql-review` catch real findings, and the platform lead sees governance, audit trails, and a one-PR rollout motion. Second, the riskiest moment (asking Claude to drop a prod table) is the safest, because the deny comes from a regex in a hook, not from model behavior. Same input, same block, every single run. Third, beat 4 turns the demo into discovery: the seller asks "what command should agents never run here?" and ships the customer's own rule, live, in about 90 seconds. The demo ends with the customer's policy in the artifact.

## The signal it worked

Within 14 days of the session, the seller runs this demo (or the ship-a-rule beat) again in another live customer conversation, verified through call recordings or CRM notes. The in-session proxy that predicts it: every attendee authors one policy rule, sees the harness pass, and triggers the block themselves before leaving the room.
