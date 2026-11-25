import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';
import { useFinePointer } from '../../hooks/useMediaQuery';

/** Restrained pointer-follow for CTAs. Only active with a fine pointer; inert on touch. */
export function Magnetic({
  children,
  strength = 0.22,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const fine = useFinePointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  if (!fine) return <span className="magnetic">{children}</span>;

  const move = (e: PointerEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <span className="magnetic" onPointerMove={move} onPointerLeave={reset}>
      <motion.span className="magnetic__inner" style={{ x: sx, y: sy }}>
        {children}
      </motion.span>
    </span>
  );
}
