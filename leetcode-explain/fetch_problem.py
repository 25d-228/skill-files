#!/usr/bin/env python3
"""Fetch a LeetCode problem's full data via GraphQL and write it as JSON.

Modeled on the user's lc_get.py — the request runs locally on the user's
machine (not LLM-side), so leetcode.com / leetcode.cn won't 403 the way
WebFetch does.

Usage:
    python3 fetch_problem.py "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/"
    python3 fetch_problem.py "https://leetcode.cn/problems/jump-game-ii/" -o /tmp/jump.json

Writes <tmpdir>/lc-<slug>.json (or the path given to -o) and prints that path
on stdout. <tmpdir> is the platform's tempfile dir (`/tmp` on Linux/macOS,
the per-user Temp directory on Windows). The JSON contains questionFrontendId,
title, translatedTitle, difficulty, content (HTML), translatedContent (HTML),
exampleTestcases, codeSnippets (all languages), plus sourceUrl and isCN flags.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import tempfile
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


QUESTION_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    translatedTitle
    titleSlug
    difficulty
    content
    translatedContent
    exampleTestcases
    hints
    codeSnippets {
      lang
      langSlug
      code
    }
    topicTags {
      name
      slug
    }
  }
}
"""

COMMON_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}


def is_url(value: str) -> bool:
    return "://" in value


def is_cn_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.netloc in {"leetcode.cn", "www.leetcode.cn"}


def validate_target_url(target: str) -> str:
    candidate = target.strip()
    if not candidate or not is_url(candidate):
        raise ValueError("Provide a full LeetCode URL.")
    parsed = urlparse(candidate)
    if parsed.netloc not in {
        "leetcode.com", "www.leetcode.com",
        "leetcode.cn", "www.leetcode.cn",
    }:
        raise ValueError("Only leetcode.com and leetcode.cn URLs are supported.")
    return candidate


def extract_problem_slug(problem_url: str) -> str:
    match = re.search(r"/problems/([^/]+)/?", urlparse(problem_url).path)
    if not match:
        raise ValueError(
            "URL does not contain '/problems/<slug>/'. "
            "Example: https://leetcode.com/problems/jump-game-ii/"
        )
    return match.group(1)


def graphql_url(target: str) -> str:
    return "https://leetcode.cn/graphql/" if is_cn_url(target) else "https://leetcode.com/graphql/"


def request_json(url: str, payload: bytes, referer: str) -> dict:
    headers = dict(COMMON_HEADERS)
    headers["Content-Type"] = "application/json"
    headers["Referer"] = referer

    last_error: Exception | None = None
    for attempt in range(3):
        request = Request(url, data=payload, headers=headers, method="POST")
        try:
            with urlopen(request, timeout=30) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError) as err:
            last_error = err
            if attempt == 2:
                break
            time.sleep(1.0 + attempt)

    if isinstance(last_error, HTTPError):
        detail = last_error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {last_error.code}: {detail}")
    raise RuntimeError(f"Request failed: {last_error}")


def fetch_question(target: str, title_slug: str) -> dict:
    payload = json.dumps({
        "operationName": "questionData",
        "variables": {"titleSlug": title_slug},
        "query": QUESTION_QUERY,
    }).encode("utf-8")
    parsed = urlparse(target)
    referer = f"{parsed.scheme}://{parsed.netloc}/problems/{title_slug}/"
    data = request_json(graphql_url(target), payload, referer)
    if data.get("errors"):
        raise RuntimeError(f"LeetCode GraphQL errors: {data['errors']}")
    question = data.get("data", {}).get("question")
    if not question:
        raise RuntimeError(f"Problem '{title_slug}' not found or no public data.")
    return question


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Fetch a LeetCode problem's full data via GraphQL."
    )
    parser.add_argument("url", help="LeetCode problem URL (leetcode.com or leetcode.cn)")
    parser.add_argument(
        "-o", "--out", default=None,
        help="Output JSON path. Default: <tempfile.gettempdir()>/lc-<slug>.json",
    )
    args = parser.parse_args()

    try:
        target = validate_target_url(args.url)
        slug = extract_problem_slug(target)
        question = fetch_question(target, slug)
        question["sourceUrl"] = target
        question["isCN"] = is_cn_url(target)

        out_path = Path(args.out) if args.out else Path(tempfile.gettempdir()) / f"lc-{slug}.json"
        out_path.write_text(
            json.dumps(question, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(out_path)
        return 0
    except Exception as err:
        print(f"Error: {err}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
