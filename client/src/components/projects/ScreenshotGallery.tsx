import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface Shot {
  src: string;
  alt: string;
}

interface ViewerProps {
  shots: Shot[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}

/** Full-screen image viewer: arrows / swipe to move, Esc or backdrop click to close, focus kept inside. */
function Viewer({ shots, index, onIndex, onClose }: ViewerProps) {
  const count = shots.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const shot = shots[index]!;

  const go = (delta: number) => onIndex((index + delta + count) % count);

  // Lock page scroll while open (compensating for the scrollbar so the page does not jump).
  useEffect(() => {
    const { body, documentElement } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, []);

  // Warm the cache for the neighbouring screenshots so arrow navigation feels instant.
  useEffect(() => {
    if (count < 2) return;
    for (const i of [(index + 1) % count, (index - 1 + count) % count]) {
      const img = new Image();
      img.src = shots[i]!.src;
    }
  }, [index, count, shots]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' && count > 1) {
        e.preventDefault();
        onIndex((index + 1) % count);
      } else if (e.key === 'ArrowLeft' && count > 1) {
        e.preventDefault();
        onIndex((index - 1 + count) % count);
      } else if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, count, onIndex, onClose]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('[data-lightbox-keep]')) onClose();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    if (start === null || count < 2) return;
    const dx = (e.changedTouches[0]?.clientX ?? start) - start;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return createPortal(
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
      onClick={onBackdrop}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={onTouchEnd}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox__btn lightbox__close"
        aria-label="Close screenshot viewer"
        data-lightbox-keep
        data-cursor="button"
        data-cursor-label="CLOSE"
        onClick={onClose}
      >
        <X size={22} aria-hidden="true" />
      </button>

      {count > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--prev"
          aria-label="Previous screenshot"
          data-lightbox-keep
          data-cursor="button"
          onClick={() => go(-1)}
        >
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
      )}

      <figure className="lightbox__figure">
        <img
          key={shot.src}
          className="lightbox__img"
          src={shot.src}
          alt={shot.alt}
          decoding="async"
          data-lightbox-keep
        />
        <figcaption className="lightbox__caption" data-lightbox-keep>
          <span aria-hidden="true">{shot.alt}</span>
          <span className="lightbox__count" aria-live="polite">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>

      {count > 1 && (
        <button
          type="button"
          className="lightbox__btn lightbox__nav lightbox__nav--next"
          aria-label="Next screenshot"
          data-lightbox-keep
          data-cursor="button"
          onClick={() => go(1)}
        >
          <ChevronRight size={26} aria-hidden="true" />
        </button>
      )}
    </div>,
    document.body,
  );
}

/** Compact thumbnail strip; clicking a thumbnail opens the viewer on the same page. */
export function ScreenshotGallery({ shots }: { shots: Shot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);

  // Hand focus back to the thumbnail that opened the viewer.
  useEffect(() => {
    if (open === null && wasOpen.current) opener.current?.focus();
    wasOpen.current = open !== null;
  }, [open]);

  if (shots.length === 0) return null;

  return (
    <div className="shots-gallery">
      <h3 className="shots-gallery__title">Screenshots</h3>
      <ul className="shots-gallery__grid">
        {shots.map((s, i) => (
          <li key={s.src}>
            <button
              type="button"
              className="shots-gallery__thumb"
              aria-label={`View screenshot ${i + 1} of ${shots.length}: ${s.alt}`}
              aria-haspopup="dialog"
              data-cursor="button"
              data-cursor-label="VIEW"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
            >
              <img src={s.src} alt="" loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && (
        <Viewer shots={shots} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}
