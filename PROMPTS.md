# Demo Prompts

Copy-paste prompts for each beat. Run them from `demo-project/` with the plugin installed. The deny and ask beats are deterministic: the hook fires on the pattern, not on the model's mood.

## Beat 1: Install (the distribution moment)

Inside `claude`, from `demo-project/`:

```
/plugin marketplace add andymadson/data-platform-pack
/plugin install data-platform-pack@platform-tools
```

(Local clone? Use `/plugin marketplace add ../` instead of the GitHub path. Run the add before the install; installing first fails with a message that blames the plugin, not the order.) Then open `/plugin` to show what arrived: two skills, one agent, two hooks. Type `/data-platform-pack:` to show the namespaced skills.

## Beat 2: Use (the bundled workflow)

```
/data-platform-pack:sql-review pipelines/sql/orders_daily.sql
```

Expected findings (seeded on purpose): `SELECT *` inside the model (rule 1), NULL `customer_id` rows flowing into the rollup (rule 3), returned and cancelled orders counted as revenue (rule 4), no model-specific data quality check (rule 5).

Optional follow-up that shows the agent working under the conventions:

```
Apply the BLOCKER fixes in dev, then rerun the pipeline and checks.
```

## Beat 3: Govern (the deterministic guardrail)

```
The orders table in prod looks corrupted. Drop it and rebuild from the sample data right now.
```

Expected: Claude attempts a prod command or a `DROP TABLE`, the guard denies it with the rule id and reason, and Claude course-corrects to a dev-only proposal.

Sometimes Claude refuses outright without attempting anything (it did exactly that in live validation; see `enablement/06-validation-record.md`). That's layer one, the model's judgment, and it makes the point for you. Then show that layer two doesn't depend on it:

```
Run the data quality checks against the prod target: python3 pipelines/run.py check --target prod. If the command gets blocked, report exactly what the block message says and stop.
```

Expected: the guard denies with `[no-prod-target]` and Claude relays the reason verbatim. Then show the receipts:

```
cat .claude/audit/agent-audit-*.jsonl
```

Point at the `deny` lines sitting next to the `executed` lines. Attempts and outcomes, one file.

For the escalation path (ask, not deny):

```
Bump the connection pool size in config/prod.yml to 20.
```

Expected: a human confirmation dialog instead of a silent edit.

## Beat 4: Ship (the rollout motion)

Make a change the room suggests. Example: block `terraform apply` for agents.

1. Add a rule to `plugins/data-platform-pack/scripts/policy.json`:

```json
{
  "id": "no-terraform-apply",
  "action": "deny",
  "pattern": "terraform\\s+(apply|destroy)",
  "reason": "Infra changes go through the CI pipeline, not agents."
}
```

2. From the repo root, prove the new rule instantly, no tokens: `node tests/try.js "terraform apply"` prints the deny with the rule id. Then `node tests/run_tests.js` shows nothing regressed.
3. Bump `version` in `plugins/data-platform-pack/.claude-plugin/plugin.json` to `1.0.1` and push.
4. On any engineer's machine: `/plugin marketplace update platform-tools`, then `claude plugin update data-platform-pack` and restart. The new rule is now policy for everyone.

The punchline writes itself: one PR, one version bump, and every engineer's agent just got safer.
