import type { ShikiTransformer, ThemedToken } from 'shiki';

interface TokenMarker {
  line: number;
  col: number;
  id: string;
}

const MARKER_RE = /\/\*\[t:([^\]]+)\]\*\//g;

export function tooltipTransformer(): ShikiTransformer {
  let markers: TokenMarker[] = [];

  return {
    name: 'learning-docs:tooltip',

    preprocess(code) {
      markers = [];
      const lines = code.split('\n');
      const cleaned = lines.map((line, lineIdx) => {
        let result = '';
        let cursor = 0;
        let match: RegExpExecArray | null;
        MARKER_RE.lastIndex = 0;
        while ((match = MARKER_RE.exec(line))) {
          result += line.slice(cursor, match.index);

          const afterMarker = match.index + match[0].length;
          let skip = afterMarker;
          while (skip < line.length && /\s/.test(line[skip])) skip++;

          markers.push({
            line: lineIdx + 1,
            col: result.length + (skip - afterMarker),
            id: match[1],
          });

          cursor = afterMarker;
        }
        result += line.slice(cursor);
        return result;
      });
      return cleaned.join('\n');
    },

    // Split tokens at marker positions so every marker lands on a span boundary.
    tokens(tokens) {
      if (markers.length === 0) return;

      const colsByLine = new Map<number, number[]>();
      for (const m of markers) {
        const arr = colsByLine.get(m.line) ?? [];
        arr.push(m.col);
        colsByLine.set(m.line, arr);
      }

      for (let lineIdx = 0; lineIdx < tokens.length; lineIdx++) {
        const cols = colsByLine.get(lineIdx + 1);
        if (!cols) continue;
        const sortedCols = [...cols].sort((a, b) => a - b);

        const lineTokens = tokens[lineIdx];
        const out: ThemedToken[] = [];
        let cursor = 0;

        for (const tok of lineTokens) {
          const tokEnd = cursor + tok.content.length;
          const splits = sortedCols.filter(c => c > cursor && c < tokEnd);

          if (splits.length === 0) {
            out.push(tok);
            cursor = tokEnd;
            continue;
          }

          let localStart = 0;
          for (const splitCol of splits) {
            const splitLocal = splitCol - cursor;
            if (splitLocal > localStart) {
              out.push({
                ...tok,
                content: tok.content.slice(localStart, splitLocal),
                offset: tok.offset + localStart,
              });
            }
            localStart = splitLocal;
          }
          if (localStart < tok.content.length) {
            out.push({
              ...tok,
              content: tok.content.slice(localStart),
              offset: tok.offset + localStart,
            });
          }
          cursor = tokEnd;
        }

        tokens[lineIdx] = out;
      }
    },

    span(node, line, col) {
      const marker = markers.find(m => m.line === line && m.col === col);
      if (!marker) return;
      node.properties = node.properties ?? {};
      node.properties['data-tip'] = marker.id;
      node.properties.tabindex = 0;
      const existing = node.properties.class;
      const classStr = typeof existing === 'string' ? existing : '';
      node.properties.class = classStr ? `${classStr} tok` : 'tok';
    },
  };
}
