#!/usr/bin/env node
/**
 * guard.js: PreToolUse policy gate for the data-platform-pack plugin.
 *
 * Reads the hook event JSON from stdin, applies scripts/policy.json, and
 * returns a permission decision. Three outcomes:
 *   - no rule matches  -> exit 0 with no output (normal permission flow)
 *   - action "deny"    -> tool call is blocked, reason is shown to Claude
 *   - action "ask"     -> the human gets a confirmation dialog
 *
 * Zero dependencies. Node 18+. Test offline with: node tests/run_tests.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FILE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (err) {
    return '';
  }
}

function loadPolicy() {
  const policyPath = path.join(__dirname, 'policy.json');
  return JSON.parse(fs.readFileSync(policyPath, 'utf8'));
}

// Minimal glob -> RegExp. Supports ** (any depth) and * (within a segment).
function globToRegExp(glob) {
  const DOUBLE = '\u0000';
  let pattern = glob.replace(/\*\*/g, DOUBLE);
  pattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  pattern = pattern.replace(/\*/g, '[^/]*');
  pattern = pattern.split(DOUBLE).join('.*');
  return new RegExp('^' + pattern + '$');
}

function relativePath(input, filePath) {
  if (!filePath) return '';
  const base = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  let rel = path.isAbsolute(filePath) ? path.relative(base, filePath) : filePath;
  return rel.split(path.sep).join('/');
}

function matchPattern(rule, text) {
  if (!rule.pattern || typeof text !== 'string') return false;
  return new RegExp(rule.pattern, rule.flags || '').test(text);
}

function appendAudit(input, record) {
  try {
    const base = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    const dir = path.join(base, '.claude', 'audit');
    fs.mkdirSync(dir, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const line = JSON.stringify(Object.assign({
      ts: new Date().toISOString(),
      session_id: input.session_id || 'unknown'
    }, record));
    fs.appendFileSync(path.join(dir, 'agent-audit-' + day + '.jsonl'), line + '\n');
  } catch (err) {
    // Audit failures never block work. The decision still stands.
  }
}

function evaluate(policy, input) {
  const verdicts = [];
  const toolName = input.tool_name || '';
  const toolInput = input.tool_input || {};

  if (toolName === 'Bash') {
    const command = toolInput.command || '';
    for (const rule of policy.bash_rules || []) {
      if (matchPattern(rule, command)) {
        verdicts.push({ rule, target: command });
      }
    }
  }

  if (FILE_TOOLS.has(toolName)) {
    const rel = relativePath(input, toolInput.file_path || toolInput.notebook_path);
    for (const rule of policy.file_rules || []) {
      for (const glob of rule.paths || []) {
        if (globToRegExp(glob).test(rel)) {
          verdicts.push({ rule, target: rel });
          break;
        }
      }
    }
    const content = [toolInput.content, toolInput.new_string]
      .concat((toolInput.edits || []).map(function (e) { return e.new_string; }))
      .filter(Boolean)
      .join('\n');
    for (const rule of policy.content_rules || []) {
      if (matchPattern(rule, content)) {
        verdicts.push({ rule, target: rel });
      }
    }
  }

  if (verdicts.length === 0) return null;
  // deny beats ask when multiple rules fire
  verdicts.sort(function (a, b) {
    return (a.rule.action === 'deny' ? 0 : 1) - (b.rule.action === 'deny' ? 0 : 1);
  });
  return verdicts[0];
}

function emit(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason
    }
  }) + '\n');
}

function main() {
  let input = {};
  try {
    input = JSON.parse(readStdin() || '{}');
  } catch (err) {
    // Unreadable event: escalate to the human rather than guessing.
    emit('ask', '[guard-error] Could not parse hook input. Escalating to human review.');
    process.exit(0);
  }

  try {
    const policy = loadPolicy();
    const verdict = evaluate(policy, input);
    if (!verdict) process.exit(0);

    const reason = '[' + verdict.rule.id + '] ' + verdict.rule.reason;
    appendAudit(input, {
      event: 'PreToolUse',
      decision: verdict.rule.action,
      rule: verdict.rule.id,
      tool: input.tool_name,
      target: String(verdict.target).slice(0, 300)
    });
    emit(verdict.rule.action === 'deny' ? 'deny' : 'ask', reason);
    process.exit(0);
  } catch (err) {
    // Policy engine failure: fail safe to a human decision, never silently allow.
    appendAudit(input, { event: 'PreToolUse', decision: 'ask', rule: 'guard-error', error: String(err).slice(0, 200) });
    emit('ask', '[guard-error] Policy engine error (' + String(err).slice(0, 120) + '). Escalating to human review.');
    process.exit(0);
  }
}

main();
