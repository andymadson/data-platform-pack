# Changelog

All notable changes to the data-platform-pack plugin. Versions here match
`plugins/data-platform-pack/.claude-plugin/plugin.json`, and a version bump is
what ships an update to every install.

## [Unreleased]

- Beat 4 of the live demo lands here: the rule your customer asks for.

## [1.0.0] - 2026-06-09

- Initial release: sql-review skill, warehouse-conventions skill, read-only
  sql-reviewer agent, PreToolUse policy guard, PostToolUse audit trail.
- Policy as reviewable config in `scripts/policy.json` (5 bash rules, 3 file
  rules, 3 content rules).
- Offline verification: 22-check harness (`tests/run_tests.js`) and one-shot
  policy checker (`tests/try.js`). Zero tokens required.
