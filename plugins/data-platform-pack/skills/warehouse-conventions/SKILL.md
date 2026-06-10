---
name: warehouse-conventions
description: The team's warehouse SQL and pipeline conventions. Use whenever writing, editing, or reviewing SQL models, pipeline code, or migrations in this repository.
---

# Warehouse Conventions

These are the team's standards for SQL models and pipelines. Reviews check against this list. New code follows it.

## SQL models

1. No `SELECT *` in any persisted model. Name every column. Schema drift upstream should break loudly at review time, not silently in a dashboard.
2. Naming: `snake_case` everywhere. Daily aggregates end in `_daily`, hourly in `_hourly`. Source tables keep their source names.
3. Every aggregate model filters or flags bad input rows explicitly. At minimum, handle NULL keys (`customer_id`, `order_id`) with a deliberate decision: exclude, bucket, or fail.
4. Revenue logic counts `complete` orders only unless the model name says otherwise. Returns and cancellations never inflate revenue.
5. Every model ships with a data quality check in `run.py check` (row count above zero plus any model-specific assertions).

## Pipelines and environments

6. Agents and local development run against the dev target only: `python3 pipelines/run.py <cmd> --target dev`. Prod deploys go through CI. This rule is also enforced deterministically by the plugin's PreToolUse hook, so do not attempt prod commands; propose them for a human instead.
7. Migrations under `migrations/` are immutable once committed. Schema changes get a new numbered migration file.
8. Secrets never appear in code or config. Use environment variables. The plugin's hook blocks writes that look like credentials.

## Review etiquette

9. Findings are specific: file, rule number, and a one-sentence fix.
10. BLOCKER findings stop a merge. WARN findings need a response, not necessarily a change.
