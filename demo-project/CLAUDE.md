# Orders ELT Pipeline

Small ELT project for the orders domain. SQLite-backed so it runs anywhere.

## Commands

- Load raw data: `python3 pipelines/run.py load --target dev`
- Build models: `python3 pipelines/run.py transform --target dev`
- Data quality checks: `python3 pipelines/run.py check --target dev`
- Everything: `python3 pipelines/run.py all --target dev`

## Layout

- `pipelines/sql/` holds SQL models (`orders_daily.sql` feeds the finance dashboard)
- `migrations/` holds numbered, immutable schema migrations
- `config/` holds per-target settings (`dev.yml`, `prod.yml`)
- `sample_data/` holds seed CSVs

## Rules of the road

Work in dev. The data-platform-pack plugin enforces the team's guardrails (no prod targets, no destructive SQL, immutable migrations, no secrets in code) and writes an audit trail to `.claude/audit/`. Follow the `warehouse-conventions` skill for SQL standards.
