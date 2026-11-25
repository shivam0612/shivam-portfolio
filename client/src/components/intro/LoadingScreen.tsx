import { motion } from 'framer-motion';
import { FLOW_POSITIONS } from '../../data/flow';
import { profile } from '../../data/profile';

const pts = FLOW_POSITIONS.map((p) => ({ x: (p.x * 600) / 100, y: (p.y * 400) / 100 }));

/** Minimal supply-chain network lighting up node by node, with a real progress rail. */
export function LoadingScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      className="splash"
      role="status"
      aria-label="Loading portfolio"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
    >
      <svg className="splash__net" viewBox="0 0 600 400" aria-hidden="true">
        {pts.map((p, i) => {
          const n = pts[(i + 1) % pts.length]!;
          return (
            <motion.line
              key={`l${i}`}
              x1={p.x}
              y1={p.y}
              x2={n.x}
              y2={n.y}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.16 }}
            />
          );
        })}
        {pts.map((p, i) => (
          <motion.circle
            key={`c${i}`}
            cx={p.x}
            cy={p.y}
            r="7"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 + i * 0.16 }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
        ))}
      </svg>
      <motion.div
        className="splash__mark"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        {profile.initials}
      </motion.div>
      <div className="splash__bar" aria-hidden="true">
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <button type="button" className="splash__skip" onClick={onSkip}>
        Skip intro
      </button>
    </motion.div>
  );
}
