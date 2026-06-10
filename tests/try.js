#!/usr/bin/env node
/**
 * try.js: one-shot policy check against the live guard.
 *
 * Ask the guard what it would do, without Claude Code, without tokens:
 *
 *   node tests/try.js "terraform apply"
 *   node tests/try.js "python3 pipelines/run.py all --target dev"
 *   node tests/try.js --write config/prod.yml "pool: 20"
 *
 * Prints the decision, the rule id, and the reason. Exit codes are scriptable:
 * 0 = allow, 1 = ask, 2 = deny. This is the live-demo verifier for beat 4:
 * add a rule to scripts/policy.json, run try.js, watch it land in under a
 * second. Use tests/run_tests.js afterward to prove nothing regressed.
 */

'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const GUARD = path.resolve(__dirname, '..', 'plugins', 'data-platform-pack', 'scripts', 'guard.js');

function usage() {
  console.log('usage: node tests/try.js "<bash command>"');
  console.log('       node tests/try.js --write <file_path> "<content>"');
  process.exit(64);
}

function buildEvent(argv) {
  if (argv[0] === '--write') {
    if (argv.length < 2) usage();
    return {
      session_id: 'try-cli',
      cwd: process.cwd(),
      hook_event_name: 'PreToolUse',
      tool_name: 'Write',
      tool_input: { file_path: path.resolve(process.cwd(), argv[1]), content: argv[2] || '' }
    };
  }
  if (argv.length < 1) usage();
  return {
    session_id: 'try-cli',
    cwd: process.cwd(),
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: argv.join(' ') }
  };
}

function main() {
  const event = buildEvent(process.argv.slice(2));
  const result = spawnSync('node', [GUARD], {
    input: JSON.stringify(event),
    encoding: 'utf8',
    env: Object.assign({}, process.env, { CLAUDE_PROJECT_DIR: process.cwd() })
  });

  if (!result.stdout || !result.stdout.trim()) {
    console.log('ALLOW  (no policy rule matched; normal permission flow applies)');
    process.exit(0);
  }

  let out;
  try {
    out = JSON.parse(result.stdout.trim()).hookSpecificOutput;
  } catch (err) {
    console.error('Could not parse guard output: ' + result.stdout);
    process.exit(70);
  }

  const decision = out.permissionDecision.toUpperCase();
  console.log(decision + '  ' + (out.permissionDecisionReason || ''));
  process.exit(out.permissionDecision === 'deny' ? 2 : out.permissionDecision === 'ask' ? 1 : 0);
}

main();
