# Facilitator Guide: Plugins, the Enterprise Rollout Story (30 minutes)

**Audience:** Applied AI Architects, Applied AI Engineers, Forward Deployed Engineers
**Format:** Terminal-first. A six-slide framing deck for the opening eight minutes (enablement/deck/index.html), then the terminal. One printed or linked handout (`03-participant-handout.md`).
**Room setup:** Facilitator laptop with the repo cloned, plugin NOT yet installed, `node tests/run_tests.js` already run once today. Attendees with laptops clone the repo before or during minute 8.
**Send attendees the day before:** the repo link, "install and authenticate Claude Code before the session," and "confirm `node --version` prints 18 or higher." Anyone who shows up without Claude Code pairs with a neighbor during hands-on.
**Pre-flight (do this the morning of):** fresh clone, run the harness (22 passes), run `python3 pipelines/run.py all --target dev`, confirm `claude` authenticates. Five minutes, and the demo cannot surprise you.

---

## 0:00 to 3:00 | The problem (talk, no screen yet)

Talk track:

"Picture the account you're working. Your champion built genuinely good Claude Code workflows: a review command, a couple of agents, some guardrails in settings. Then you ask the platform lead about rollout and the energy leaves the room. Two hundred engineers means two hundred copies of a `.claude/` folder, zero versioning, no way to push a fix, and security has no idea what's running where. That's not a tooling complaint. That's the objection that stalls the deal.

Plugins are Claude Code's answer. A plugin bundles skills, agents, and hooks into one unit with a version on it. A marketplace is a git repo the platform team owns that catalogs plugins. Install is one command. Updates are one command. Policy travels inside the package. Today you'll run that whole motion, and by the end you'll have shipped a policy change to a fleet."

Field note for the room: you'll teach subagents, hooks, and skills on other days. Plugins are where those pieces stop being a laptop setup and become something an enterprise can adopt.

## 3:00 to 8:00 | Anatomy (slides 2 and 3, plus the handout diagram, 5 minutes)

Walk the diagram on the handout. Three layers, keep it tight:

1. **Marketplace:** a git repo with `.claude-plugin/marketplace.json`. Name, owner, list of plugins and their sources. The platform team owns this repo and reviews PRs to it like any other code.
2. **Plugin:** a directory with `.claude-plugin/plugin.json` (the manifest; `name` is the only required field) and components at the plugin root: `skills/`, `agents/`, `hooks/hooks.json`, optionally `.mcp.json`. Everything is namespaced by plugin name, so `/data-platform-pack:sql-review` can't collide with anything else.
3. **Distribution:** `/plugin marketplace add owner/repo`, then `/plugin install name@marketplace`. Installed plugins are copied to a local cache and pinned by version. Bump the version, push, engineers update. Admins can go further with `extraKnownMarketplaces` in project settings and managed-settings allowlists, but don't demo that; just say it exists.

Two facts to state out loud because they prevent later confusion: components live at the plugin root, not inside `.claude-plugin/` (that folder holds only the manifest), and the cache copy means editing your checkout doesn't change an installed plugin until you ship a new version.

## 8:00 to 20:00 | The 4-beat demo (live)

Prompts are verbatim in `PROMPTS.md`. Narrate decisions, not keystrokes.

**Beat 1, Install (8:00 to 10:00).** From `demo-project/`, add the marketplace and install. Restart. Open `/plugin` and show what arrived: two skills, one agent, two hooks, version 1.0.0. Line to land: "Ninety seconds ago this machine was vanilla. Now it has the team's conventions, reviewer, and guardrails, identical to every other machine that runs these two commands."

**Beat 2, Use (10:00 to 13:00).** Run `/data-platform-pack:sql-review pipelines/sql/orders_daily.sql`. The model has four seeded findings: `SELECT *` in a persisted model, NULL customer keys flowing into the rollup, returned and cancelled orders counted as revenue, and no data quality check. Point out that the findings cite rule numbers from the `warehouse-conventions` skill. The review isn't generic AI taste; it's their written standards, applied by a read-only agent that ships in the same package.

**Beat 3, Govern (13:00 to 17:00).** Ask Claude to drop the corrupted prod table and rebuild it. The guard denies the prod command with a rule id and reason, and Claude course-corrects to a dev proposal. **Pause here.** This is where someone asks the question; see objections below. Then `cat .claude/audit/agent-audit-*.jsonl` and show `deny` lines next to `executed` lines. Line to land: "Attempts and outcomes in one file. That's the artifact your security review asks for." Optionally run the prod-config edit prompt to show `ask`: deny isn't the only verb, escalation to a human is policy too.

**Beat 4, Ship (17:00 to 20:00).** Ask the room: "What's one command agents should never run in your accounts?" Take the first answer (terraform apply is the usual one), add the rule to `policy.json`, prove it with `node tests/try.js "terraform apply"` (instant deny, zero tokens), run the harness to show nothing regressed, bump the manifest to 1.0.1, and narrate the update motion (`/plugin marketplace update`, plugin update, restart). Line to land: "One PR, one version bump, and every engineer's agent just got safer. That's the rollout motion your platform lead has been asking for."

If anything drifts: the model improvising is fine (the guard catches patterns, not intentions), and the harness is your fallback. `node tests/try.js "<any command>"` shows the deny without burning a token.

## 20:00 to 26:00 | Hands-on

Attendees, from their clone: run the harness, install from the local marketplace (`/plugin marketplace add ..`), trigger one deny themselves, then add one rule of their own and make the harness pass with it. Facilitator circulates. The bar for leaving: everyone has personally authored a rule and watched it block. No laptops in the room? Run beat 4 twice more with audience-supplied rules.

## 26:00 to 30:00 | Field guidance and close

**Discovery questions that open this conversation:** Who owns developer tooling standards here? What's your current story for agent governance and audit? What command should an AI agent never run in this codebase? How do you ship a tooling change to every engineer today?

**Objection handling:**

- *"Why not just commit a `.claude/` folder to each repo?"* Works for one repo. Plugins add versioning, cross-repo distribution, namespacing, a review point the platform team owns, and managed-settings control. The folder is a starting point; the plugin is the operating model.
- *"The model could just ignore instructions."* Instructions, yes. This isn't an instruction. The guard is a separate process that gates the tool call; the decision is a regex match, not a model choice. Invite them to read `guard.js`. It's 158 lines and that's the point.
- *"Who reviews plugin code? This is supply chain."* Correct instinct, and the answer is the model itself: internal marketplace, PR review on the catalog repo, version pins, and managed-settings allowlists for which marketplaces are even addable. Treat plugins like any internal package registry.
- *"Is this a sandbox?"* No. It's policy distribution plus audit, one layer of defense in depth. Warehouse permissions and IAM still do their jobs.

**Where this lands in a POC:** week one, fork this repo, replace `warehouse-conventions` and `policy.json` with the customer's real standards, and you've turned a demo into their internal tooling. The artifact survives the meeting.

Close the session by deleting your local plugin and rein