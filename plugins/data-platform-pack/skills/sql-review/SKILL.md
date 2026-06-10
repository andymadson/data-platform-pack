---
name: sql-review
description: Review SQL models and pipeline code against the team's warehouse conventions. Invoke on a specific file, a directory, or recent changes.
disable-model-invocation: true
argument-hint: [path to a SQL file or directory, optional]
---

Run a conventions review on SQL and pipeline code in this repository.

Review target (may be empty): $ARGUMENTS

Scope:
1. If a target is given above, review that file or directory.
2. If the target is empty, review SQL files modified in the working tree (`git status`), falling back to everything under `pipelines/`.

Process:
1. Read the `warehouse-conventions` skill from this plugin and treat it as the rulebook.
2. Launch the `sql-reviewer` agent to do the detailed pass. Give it the file list and tell it to check every rule in the conventions.
3. Do not modify any files during the review. Report only.

Output format:
- One finding per line: `SEVERITY | file | rule | one-sentence fix`
- Severities: BLOCKER (breaks a convention that protects prod or data quality), WARN (style or maintainability), INFO (suggestion)
- End with a one-line summary: counts by severity and whether the model is safe to ship.
- If the user asks you to apply the fixes afterward, apply them in dev only and rerun the pipeline with `python3 pipelines/run.py transform --target dev` followed by `python3 pipelines/run.py check --target dev`.
