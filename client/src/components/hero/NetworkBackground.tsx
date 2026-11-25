import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}
interface Packet {
  a: number;
  b: number;
  t: number;
  speed: number;
}

const LINK = 120;

/**
 * Ambient logistics network drawn on a <canvas>: drifting nodes, faint links and small data packets
 * hopping along them. Lifecycle: paused when scrolled off-screen or in a hidden tab, a single static
 * frame under prefers-reduced-motion, DPR capped at 1.5, everything cleaned up on unmount.
 */
export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let raf = 0;
    let last = 0;
    let onScreen = true;

    const seed = () => {
      const count = Math.round(Math.min(54, Math.max(14, (w * h) / 24000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.8 + Math.random() * 1.4,
      }));
      packets = [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = host.clientWidth;
      h = host.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    };

    function neighbour(i: number): number {
      const a = nodes[i]!;
      let best = -1;
      let bestD = LINK;
      nodes.forEach((n, j) => {
        if (j === i) return;
        const d = Math.hypot(n.x - a.x, n.y - a.y);
        if (d < bestD && Math.random() < 0.5) {
          bestD = d;
          best = j;
        }
      });
      return best;
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i]!.x - nodes[j]!.x, nodes[i]!.y - nodes[j]!.y);
          if (d < LINK) {
            ctx!.strokeStyle = `rgba(56,189,248,${(1 - d / LINK) * 0.2})`;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i]!.x, nodes[i]!.y);
            ctx!.lineTo(nodes[j]!.x, nodes[j]!.y);
            ctx!.stroke();
          }
        }
      }
      ctx!.fillStyle = 'rgba(148,163,184,0.55)';
      for (const n of nodes) {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      if (dt === 0) return;
      if (packets.length < 5 && Math.random() < 0.03) {
        const a = Math.floor(Math.random() * nodes.length);
        const b = neighbour(a);
        if (b !== -1) packets.push({ a, b, t: 0, speed: 0.0005 + Math.random() * 0.0006 });
      }
      packets = packets.filter((p) => (p.t += p.speed * dt) < 1);
      for (const p of packets) {
        const a = nodes[p.a]!;
        const b = nodes[p.b]!;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx!.fillStyle = 'rgba(56,189,248,0.16)';
        ctx!.beginPath();
        ctx!.arc(x, y, 6, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = '#38BDF8';
        ctx!.beginPath();
        ctx!.arc(x, y, 2, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const frame = (time: number) => {
      const dt = Math.min(48, time - last || 16);
      last = time;
      draw(dt);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (reduce || raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      if (onScreen) start();
      else stop();
    });
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    resizeObserver.observe(host);
    intersection.observe(host);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce]);

  return <canvas ref={canvasRef} className="network-bg" aria-hidden="true" />;
}
