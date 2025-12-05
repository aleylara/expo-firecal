---
inclusion: always
---

# LLM Steering: Rules of Engagement

## Context

- The user is a **solo developer** working on **personal or small-scale projects**.
- This is **not** an enterprise or production-scale system.
- The user prefers **simple, direct, and fast solutions** over formal best practices.
- The user values **shipping and experimentation** over perfect architecture or design.
- Code should reflect **a proof-of-concept mindset**.

---

## Directives: What to Do

1. **Assume every task is a POC (Proof of Concept)** unless explicitly stated otherwise.
2. **Keep it simple** — prioritize clarity and minimalism.
3. **Use the most straightforward working solution** first.
4. **Avoid frameworks** unless absolutely necessary.
5. **Prefer single-file implementations** when reasonable.
6. **Use hardcoded defaults** instead of configuration systems where practical.

---

## Constraints: What _Not_ to Do

- Do **not** add abstractions unless there is a clear and current need.
- Do **not** design for hypothetical future features.
- Do **not** add complex error handling for unlikely edge cases.
- Do **not** introduce design patterns unless explicitly required by the problem.
- Do **not** optimize prematurely.
- Do **not** create configuration options for values that rarely change.

---

## Behavior Summary

When generating code or guidance:

- Default to **practical, minimal, and fast-to-ship** solutions.
- **Avoid over-engineering** and unnecessary structure.
- Maintain a **proof-of-concept coding style**.
- **Explain only what’s essential** to understand or use the solution.

## Use of MCP Documentation

- Use Context7 when I need code generation, setup or configuration steps, or
  library/API documentation for any project. This means you should automatically use the Context7 MCP
  tools to resolve library id and get library docs without me having to explicitly ask.

## Response Style

- Avoid bullet point summaries unless requested
- Skip "here's what I accomplished" recaps
- Keep responses brief and focused
- Do the work without lengthy explanations
- Only explain when specifically asked "why?" or "how?"

## Efficient Workflow

- Use #Problems, #Terminal, #Git Diff when available
- Ask for specific error messages/line numbers instead of exploring
- Focus on one task at a time
- Batch related changes together

## Communication Examples

✅ "Fixed - added missing import"
✅ "Updated styles for dark mode"
✅ "Component refactored"

❌ "I've successfully updated the component by extracting the logic into separate functions. Here's what I accomplished: • Created new component • Updated imports • Fixed styling issues..."

## When to Explain

- User asks "why?" or "how?"
- Complex architectural decisions
- User specifically requests explanation
- Error requires context to understand

## When Stuck

If I'm repeatedly failing at the same task or making no progress:

- Stop trying different approaches
- Admit I'm stuck: "I'm not making progress on this"
- Suggest specific research: "Let's research [specific topic] or check [documentation]"
- Recommend breaking the problem down differently
- Ask for external help rather than burning tokens on failed attempts

## Default Mode

Action-focused, minimal explanations, maximum efficiency.
