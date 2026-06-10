# Loom Script: Session Arc + Demo Walkthrough (target 4:45)

Recording notes: single take, terminal at full screen with a large font, the handout open in one browser tab for the anatomy moment. Do the pre-flight first (fresh clone, harness green, plugin uninstalled) so the install beat is real. Speak to an Anthropic AAI engineer, peer to peer. The narration below covers the decisions the design note can't: pacing, where to pause, what's live versus pre-baked.

---

**0:00 to 0:20 | Cold open (screen: terminal, the deny already on screen from a warm-up run)**

"This is a Claude Code plugin refusing to let an agent drop a prod table. Same input, same block, every run. In the next four minutes I'll show you the 30-minute session and the demo built around moments like this one."

**0:20 to 1:00 | Why plugins (screen: face or repo root)**

"I picked plugins over subagents and hooks because plugins are the capstone. They're the package that bundles skills, agents, and hooks into one versioned unit, which makes them the answer to the question that actually stalls enterprise deals: how do 200 engineers get the same setup, with our policies attached? The session teaches one concept but a seller leaves able to gesture at the whole surface, because all of it ships inside the package."

**1:00 to 1:45 | Session arc (screen: facilitator guide, scroll slowly)**

"Thirty minutes, four movements. Three minutes on the rollout problem, no screen, just the story every platform lead recognizes. Five minutes of anatomy on a one-page handout: marketplace, plugin, distribution. Twelve minutes of live demo in four beats. Then hands-on, where every attendee authors a policy rule and triggers the block themselves, and we close with field guidance: discovery questions and the three objections that always come up. No slides anywhere. The terminal is the deck, and for this audience it's a more credible one."

**1:45 to 3:30 | Demo walkthrough (screen: terminal, run beats live)**

"Beat one, install. Marketplace add, plugin install, ninety seconds from vanilla machine to standardized machine. I run this live because it's fast and it IS the product." (Run it.)

"Beat two, use. The bundled sql-review skill on a pipeline with findings seeded on purpose: SELECT star, NULL keys leaking into a revenue rollup, returns counted as revenue. The findings cite the team's own rule numbers, which is the difference between AI taste and their standards." (Run it, let two findings render, move on. Don't wait for the full review; narrate over it.)

"Beat three, govern. I ask for the scariest thing I can think of." (Run the drop-prod prompt.) "Denied, with the rule id, and the agent course-corrects to dev. Then the audit file: denials sitting next to executions. This is the moment to pause in the room, because someone will say the model could ignore instructions, and the answer is on screen: this isn't an instruction, it's a process gate."

"Beat four, ship. The room gives me a command agents should never run, I add the rule, and I pre-bake exactly nothing for this beat. The one-shot checker verifies the new rule in under a second with zero tokens, so it can't flake." (Add the rule, run `node tests/try.js "terraform apply"`, and watch the deny land with the new rule id in under a second. Then the harness proves nothing regressed.) "Version bump to 1.0.1, push, fleet update. The demo ends with the customer's policy inside the artifact."

**3:30 to 4:15 | Pacing and live-versus-canned decisions (screen: face or PROMPTS.md)**

"Pacing choices worth stealing. Everything runs live: the install because it's fast, the deny because it's deterministic, the review because seeded findings make the model's job easy. The one planned pause is right after the first deny; let the objection surface, then answer it with the audit log instead of a claim. If the model improvises a different dangerous command, even better, the guard catches the pattern. And if the network or the model has a bad day, the harness is the fallback: `node tests/try.js` shows the exact same block offline."

**4:15 to 4:45 | Close (screen: terminal)**

"Success signal: within two weeks the seller runs this, or just the ship-a-rule beat, in a real customer conversation. The in-session predictor is that every attendee personally shipped a rule and watched it block. The whole kit is in the repo: design note, facilitator guide, handout, demo, harness, prompts. Clone it, run the harness, and you're demo-ready in five minutes." (Uninstall and reinstall the plugin on camera, under a minute, and end on the install completing.) "Distribution is the product. Worth showing twice."
