# LeetCode Link Explanations

> **Invocation:** Use only when explicitly invoked (e.g. `/leetcode-explain [leetcode-url]`). Do not auto-trigger on phrases like "explain this leetcode problem", "walk me through this", or a bare LeetCode URL.

Fetch a LeetCode problem page and produce a structured explanation with a worked example and runnable code.

## When to use

The user provides a `leetcode.com` or `leetcode.cn` URL and asks to understand or solve it.

## Workflow

1. **Fetch the URL** with `WebFetch`. Never answer from memory alone when a URL is provided.
2. **Extract** the problem statement, examples, and constraints from the page.
3. If the page is gated or partial, extract whatever is available and fall back to recognized-problem knowledge for the rest.

## Output format

Respond in this order:

1. **Problem summary** — 2–4 sentences. Keep it short; the user already linked the problem.
2. **Key insight** — the core idea that makes the solution work.
3. **Step-by-step algorithm** — concrete steps, not vague descriptions.
4. **Worked example** — trace one of the problem's own examples. Prefer a table (`index | value | running state | decision`).
5. **Implementation** — code in the requested language; default **C++**.
6. **Complexity** — time and space.

## Response language

Detect the language of the fetched problem body:

- English content (`leetcode.com`) → respond in **English**.
- Chinese content (`leetcode.cn`) → respond in **Chinese (中文)**.
- Mixed or unclear → follow the **problem description body**.

An explicit user request ("explain in English", "用中文解释") always overrides auto-detection.

## Programming language

- Default to **C++** when unspecified.
- Honor any explicit request ("in Python", "using Java").
- Do not ask a follow-up question about language — pick the default and proceed.

## Style

- Be concrete. Show the actual state of data structures at each step.
- Prefer tables for example traces.
- No padding, disclaimers, or meta-commentary.
