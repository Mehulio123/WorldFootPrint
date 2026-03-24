'use client';

import { useRef, useState } from 'react';

export function HeroCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [springing, setSpringing] = useState(false);

  function getPos(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width - 0.5,   // -0.5 → 0.5
      y: (e.clientY - r.top)  / r.height - 0.5,
    };
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { x, y } = getPos(e);
    const max = dragging ? 24 : 14;
    setSpringing(false);
    setTilt({ rx: -y * max, ry: x * max, scale: dragging ? 1.05 : 1.02 });
  }

  function onMouseLeave() {
    setDragging(false);
    setSpringing(true);
    setTilt({ rx: 0, ry: 0, scale: 1 });
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
    const { x, y } = getPos(e);
    setSpringing(false);
    setTilt({ rx: -y * 24, ry: x * 24, scale: 1.05 });
  }

  function onMouseUp() {
    setDragging(false);
    // stay at current tilt position, just reduce scale slightly
    setTilt(t => ({ ...t, scale: 1.02 }));
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={{
        position: 'relative',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.scale})`,
        transition: springing
          ? 'transform 0.65s cubic-bezier(0.23, 1, 0.32, 1)'
          : 'transform 0.08s ease',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
