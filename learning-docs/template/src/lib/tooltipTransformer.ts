import type { ShikiTransformer } from 'shiki';

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
            col: result.length + (skip - afterMarker) + 1,
            id: match[1],
          });

          cursor = afterMarker;
        }
        result += line.slice(cursor);
        return result;
      });
      return cleaned.join('\n');
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
