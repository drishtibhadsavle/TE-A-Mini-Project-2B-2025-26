import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const TRAIL_COUNT = 6;

export const CursorEffect: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create springs for a trailing effect
  const trail = Array.from({ length: TRAIL_COUNT }).map((_, i) => ({
    x: useSpring(mouseX, { stiffness: 500 - i * 60, damping: 25 + i * 5, mass: 0.5 }),
    y: useSpring(mouseY, { stiffness: 500 - i * 60, damping: 25 + i * 5, mass: 0.5 }),
  }));

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      const hoverTarget = target.closest('a, button, [role="button"]');
      setIsHovering(!!hoverTarget);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="cursor-container">
      {trail.map((point, i) => (
        <motion.div
          key={i}
          className="cursor-particle"
          style={{
            x: point.x,
            y: point.y,
            scale: isHovering ? 1.5 - i * 0.1 : 1.2 - i * 0.15,
            opacity: 1 - i * (1 / TRAIL_COUNT),
            zIndex: 9999 - i,
          }}
        />
      ))}
    </div>
  );
};
