#!/usr/bin/env node
/**
 * audit.js: PostToolUse audit trail for the data-platform-pack plugin.
 *
 * Appends one JSON line per successful tool call to
 * <project>/.claude/audit/agent-audit-YYYY-MM-DD.jsonl
 *
 * Together with guard.js (which logs deny and ask decisions), this gives a
 * complete record: what the agent tried, what was blocked, what ran.
 * Zero dependencies. Never blocks anything. Exit code is always 0.
 */

'use strict';

const fs = require('fs');
const path = require('path');

function summarizeTarget(input) {
  const t = input.tool_input || {};
  if (typeof t.command === 'string') return t.command.slice(0, 300);
  if (typeof t.file_path === 'string') return t.file_path.slice(0, 300);
  if (typeof t.notebook_path === 'string') return t.notebook_path.slice(0, 300);
  if (typeof t.pattern === 'string') return t.pattern.slice(0, 300);
  if (typeof t.url === 'string') return t.url.slice(0, 300);
  return '';
}

function main() {
  let input = {};
  try {
    input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch (err) {
    process.exit(0);
  }

  try {
    const base = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const dir = path.join(base, '.claude', 'audit');
    fs.mkdirSync(dir, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const record = {
      ts: new Date().toISOString(),
      session_id: input.session_id || 'unknown',
      event: 'PostToolUse',
      decision: 'executed',
      tool: input.tool_name || 'unknown',
      target: summarizeTarget(input)
    };
    fs.appendFileSync(
      path.join(dir, 'agent-audit-' + day + '.jsonl'),
      JSON.stringify(record) + '\n'
    );
  } catch (err) {
    // Logging must never interfere with the session.
  }
  process.exit(0);
}

main();
