import type { IllustrationKind } from '../../data/types';

/**
 * Original abstract illustrations (no screenshots, no data). They depict the *idea* of each
 * concept and deliberately contain no numbers, so they cannot be mistaken for real results.
 */
export function ProjectIllustration({ kind }: { kind: IllustrationKind }) {
  return (
    <svg
      className="illo"
      viewBox="0 0 400 240"
      role="img"
      aria-label={`Abstract ${kind} illustration`}
      focusable="false"
    >
      <defs>
        <linearGradient id={`g-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect className="illo__frame" x="16" y="16" width="368" height="208" rx="12" />
      {kind === 'dashboard' && (
        <g>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              className="illo__tile"
              x={32 + i * 116}
              y="34"
              width="104"
              height="44"
              rx="6"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={44 + i * 116}
              y="46"
              width="36"
              height="6"
              rx="3"
              fill="#94A3B8"
              opacity=".6"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={44 + i * 116}
              y="58"
              width="60"
              height="10"
              rx="3"
              fill={`url(#g-${kind})`}
            />
          ))}
          <rect className="illo__tile" x="32" y="92" width="196" height="112" rx="6" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              className="illo__bar"
              x={46 + i * 26}
              y={190 - [30, 52, 40, 66, 48, 76, 58][i]!}
              width="16"
              height={[30, 52, 40, 66, 48, 76, 58][i]}
              rx="3"
              fill={`url(#g-${kind})`}
            />
          ))}
          <rect className="illo__tile" x="240" y="92" width="128" height="112" rx="6" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect
                x="252"
                y={106 + i * 20}
                width="40"
                height="6"
                rx="3"
                fill="#94A3B8"
                opacity=".55"
              />
              <rect
                x="304"
                y={106 + i * 20}
                width="52"
                height="6"
                rx="3"
                fill="#94A3B8"
                opacity=".3"
              />
            </g>
          ))}
          <circle className="illo__pulse" cx="348" cy="106" r="4" fill="#34D399" />
        </g>
      )}
      {kind === 'inventory' && (
        <g>
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <line className="illo__line" x1="36" x2="236" y1={92 + r * 52} y2={92 + r * 52} />
              {[0, 1, 2, 3].map((c) => (
                <rect
                  key={c}
                  className="illo__tile"
                  x={44 + c * 48}
                  y={64 + r * 52}
                  width="38"
                  height="26"
                  rx="4"
                />
              ))}
            </g>
          ))}
          <path
            className="illo__flow"
            d="M244 118 C 270 118, 270 118, 296 118"
            fill="none"
            stroke={`url(#g-${kind})`}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M290 112 L298 118 L290 124"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse className="illo__tile" cx="338" cy="84" rx="32" ry="10" />
          <path className="illo__tile" d="M306 84 v70 a32 10 0 0 0 64 0 v-70" />
          <ellipse cx="338" cy="118" rx="32" ry="10" fill="none" stroke="#94A3B8" opacity=".4" />
          <ellipse cx="338" cy="148" rx="32" ry="10" fill="none" stroke="#94A3B8" opacity=".4" />
          <circle className="illo__pulse" cx="338" cy="84" r="3" fill="#34D399" />
        </g>
      )}
      {kind === 'workflow' && (
        <g>
          {[
            [70, 80],
            [200, 80],
            [330, 80],
            [330, 164],
            [200, 164],
            [70, 164],
          ].map(([x, y], i, a) => {
            const n = a[(i + 1) % a.length]!;
            return (
              <line
                key={`l${i}`}
                className="illo__line"
                x1={x}
                y1={y}
                x2={n[0]}
                y2={n[1]}
                strokeDasharray={i === 5 ? '4 5' : undefined}
              />
            );
          })}
          {[
            [70, 80],
            [200, 80],
            [330, 80],
            [330, 164],
            [200, 164],
            [70, 164],
          ].map(([x, y], i) => (
            <g key={`n${i}`}>
              <circle className="illo__tile" cx={x} cy={y} r="18" />
              <circle cx={x} cy={y} r="5" fill={i % 2 ? '#8B5CF6' : '#38BDF8'} />
            </g>
          ))}
          <circle className="illo__pulse" cx="200" cy="80" r="4" fill="#34D399" />
        </g>
      )}
      {kind === 'lab' && (
        <g>
          <rect className="illo__tile" x="36" y="40" width="200" height="164" rx="8" />
          <circle cx="50" cy="54" r="3.5" fill="#94A3B8" opacity=".6" />
          <circle cx="62" cy="54" r="3.5" fill="#94A3B8" opacity=".6" />
          <circle cx="74" cy="54" r="3.5" fill="#94A3B8" opacity=".6" />
          {[
            [52, 84, 90],
            [64, 104, 120],
            [64, 124, 70],
            [52, 144, 100],
            [64, 164, 56],
          ].map(([x, y, w], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height="7"
              rx="3.5"
              fill={i % 2 ? '#8B5CF6' : '#38BDF8'}
              opacity=".75"
            />
          ))}
          <path
            className="illo__tile"
            d="M300 60 h28 M308 60 v40 l-30 56 a10 10 0 0 0 9 15 h58 a10 10 0 0 0 9 -15 l-30 -56 v-40"
          />
          <circle className="illo__pulse" cx="326" cy="168" r="5" fill="#34D399" />
          <circle cx="312" cy="156" r="3" fill="#38BDF8" opacity=".8" />
        </g>
      )}
    </svg>
  );
}
