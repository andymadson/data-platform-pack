# How This Kit Was Built (With AI, Verified by Hand)

This kit was built in a working session with Claude, treating the model the way the session itself teaches customers to treat agents: full delegation on production, deterministic verification on everything that matters.

## The division of labor

Claude did the production work. It chose the demo domain, designed the four-beat arc, wrote every deliverable, built the plugin, the marketplace, the seeded pipeline, and the test harness, then audited its own output against the assignment and fixed what it found (including one factual error it had introduced about test counts, which is exactly the failure mode the verification layer exists to catch).

The human set direction and owns the judgment calls. Picking plugins over hooks was a human decision with a thesis behind it: plugins are the capstone concept, the package an enterprise actually adopts after learning the individual pieces. The human also runs the live rehearsal in a real Claude Code session, records the Loom, and stands behind every claim in front of a room.

## How accuracy was enforced

Plugin schemas change faster than any model's training data. So nothing in this kit rests on the model's memory:

1. Every schema claim (plugin.json fields, marketplace.json structure, hook decision contract, `${CLAUDE_PLUGIN_ROOT}` quoting) was fetched from code.claude.com during the build and cross-checked against Anthropic's own marketplace repos.
2. Everything executable was executed. The 22-check harness passed, the pipeline ran end to end, and `try.js` was smoke-tested across allow, ask, and deny paths before any document claimed it worked.
3. The one surface that can't be verified without credentials (a live, authenticated Claude Code session) is named explicitly in the kit, with the rehearsal as its control. Unverified claims get labeled, not asserted.

## Why this is the point

The role asks for AI as a core working method, and the kit demonstrates the method twice over: AI built an enablement kit about governing AI, and the same pattern that kept this build honest (deterministic checks wrapped around probabilistic generation) is the pattern beat 3 of the demo sells. The build is the pitch.
