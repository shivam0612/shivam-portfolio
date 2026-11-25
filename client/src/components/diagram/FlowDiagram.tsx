import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { FLOW_POSITIONS, type FlowNode } from '../../data/flow';
import { flowIcons } from '../common/iconMaps';

const W = 600;
const H = 400;
const pts = FLOW_POSITIONS.map((p) => ({ x: (p.x * W) / 100, y: (p.y * H) / 100 }));
const loopPath = `M${pts.map((p) => `${p.x} ${p.y}`).join(' L')} Z`;
const segments = pts.map((p, i) => ({
  from: p,
  to: pts[(i + 1) % pts.length]!,
  feedback: i === pts.length - 1,
}));
const packets = [
  { color: '#38BDF8', begin: 0 },
  { color: '#8B5CF6', begin: -5.4 },
  { color: '#34D399', begin: -10.8 },
];

interface BaseProps<T extends FlowNode> {
  nodes: T[];
  ariaLabel: string;
  cursorLabel?: string;
}
interface TooltipProps<T extends FlowNode> extends BaseProps<T> {
  mode: 'tooltip';
  describe: (node: T) => string;
}
interface SelectProps<T extends FlowNode> extends BaseProps<T> {
  mode: 'select';
  selectedId: string;
  onSelect: (id: string) => void;
  controlsId: string;
}

/**
 * Six-node operational loop. Packets travel along the SVG path (SMIL animateMotion, omitted for
 * reduced motion). Nodes are real buttons, so the diagram works with keyboard and screen readers:
 * 'tooltip' mode explains a node on hover/focus/tap, 'select' mode drives a detail panel.
 * Arrow keys / Home / End move between nodes.
 */
export function FlowDiagram<T extends FlowNode>(props: TooltipProps<T> | SelectProps<T>) {
  const { nodes, ariaLabel, cursorLabel = 'INSPECT' } = props;
  const reduce = useReducedMotion();
  const uid = useId();
  const [active, setActive] = useState<string | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // SMIL packets run on the main thread, so pause them whenever the diagram is scrolled out of view.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) svg.unpauseAnimations?.();
      else svg.pauseAnimations?.();
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const current = refs.current.findIndex((el) => el === document.activeElement);
    if (current === -1) return;
    e.preventDefault();
    const last = nodes.length - 1;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowRight' || e.key === 'ArrowDown'
            ? (current + 1) % nodes.length
            : (current - 1 + nodes.length) % nodes.length;
    refs.current[next]?.focus();
    if (props.mode === 'select') props.onSelect(nodes[next]!.id);
  };

  const activeNode = props.mode === 'tooltip' ? nodes.find((n) => n.id === active) : undefined;
  const tipId = `${uid}-tip`;

  return (
    <div className="flow" role="group" aria-label={ariaLabel} onKeyDown={onKeyDown}>
      <svg
        ref={svgRef}
        className="flow__svg"
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={`${uid}-line`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={W}
            y2={H}
          >
            <stop offset="0" stopColor="#38BDF8" />
            <stop offset="0.55" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#34D399" />
          </linearGradient>
        </defs>
        {segments.map((s, i) => (
          <line
            key={`base-${i}`}
            className={`flow__line${s.feedback ? ' flow__line--feedback' : ''}`}
            x1={s.from.x}
            y1={s.from.y}
            x2={s.to.x}
            y2={s.to.y}
          />
        ))}
        {segments.map((s, i) => (
          <line
            key={`energy-${i}`}
            className={`flow__line flow__line--energy${s.feedback ? ' flow__line--feedback' : ''}`}
            x1={s.from.x}
            y1={s.from.y}
            x2={s.to.x}
            y2={s.to.y}
            stroke={`url(#${uid}-line)`}
          />
        ))}
        {!reduce &&
          packets.map((p) => (
            <g key={p.color}>
              <circle r="9" fill={p.color} opacity="0.16">
                <animateMotion
                  dur="16s"
                  repeatCount="indefinite"
                  begin={`${p.begin}s`}
                  path={loopPath}
                />
              </circle>
              <circle r="3.6" fill={p.color}>
                <animateMotion
                  dur="16s"
                  repeatCount="indefinite"
                  begin={`${p.begin}s`}
                  path={loopPath}
                />
              </circle>
            </g>
          ))}
      </svg>

      {nodes.map((node, i) => {
        const Icon = flowIcons[node.icon];
        const selected = props.mode === 'select' && props.selectedId === node.id;
        const modeProps =
          props.mode === 'select'
            ? {
                'aria-pressed': selected,
                'aria-controls': props.controlsId,
                onClick: () => props.onSelect(node.id),
              }
            : {
                'aria-describedby': active === node.id ? tipId : undefined,
                onPointerEnter: (e: React.PointerEvent) =>
                  e.pointerType === 'mouse' && setActive(node.id),
                onPointerLeave: (e: React.PointerEvent) =>
                  e.pointerType === 'mouse' && setActive((a) => (a === node.id ? null : a)),
                onFocus: () => setActive(node.id),
                onBlur: () => setActive((a) => (a === node.id ? null : a)),
                onClick: () => setActive((a) => (a === node.id ? null : node.id)),
              };
        return (
          <button
            key={node.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            className={`flow-node${selected ? ' is-selected' : ''}${active === node.id ? ' is-active' : ''}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            data-cursor="diagram"
            data-cursor-label={cursorLabel}
            {...modeProps}
          >
            <span className="flow-node__orb">
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="flow-node__label">{node.label}</span>
          </button>
        );
      })}

      <AnimatePresence>
        {props.mode === 'tooltip' && activeNode && (
          <motion.div
            key={activeNode.id}
            id={tipId}
            role="tooltip"
            className="flow-tip"
            data-v={activeNode.y < 50 ? 'below' : 'above'}
            data-h={activeNode.x < 30 ? 'start' : activeNode.x > 70 ? 'end' : 'center'}
            style={{ left: `${activeNode.x}%`, top: `${activeNode.y}%` }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <strong>{activeNode.label}</strong>
            <span>{props.describe(activeNode)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
