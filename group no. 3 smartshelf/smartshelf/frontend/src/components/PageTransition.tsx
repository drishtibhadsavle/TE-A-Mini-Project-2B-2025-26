import { motion } from "framer-motion";
import React from "react";

const pageVariants = {
  initial: {
    opacity: 0,
    rotateY: 90,
  },
  in: {
    opacity: 1,
    rotateY: 0,
  },
  out: {
    opacity: 0,
    rotateY: -90,
  },
};

const pageTransitionConfig = {
  duration: 0.6,
  ease: [0.42, 0, 0.58, 1],
};

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  if (!children) return null;
  
  return (
    <div style={{ 
      display: "grid",
      gridTemplateColumns: "100%",
      gridTemplateRows: "min-content",
      perspective: "1500px", 
      width: "100%", 
      minHeight: "100vh", 
      position: "relative", 
      overflowX: "hidden" 
    }}>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransitionConfig}
        style={{
          gridArea: "1 / 1 / 2 / 2",
          width: "100%",
          height: "100%",
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          zIndex: 1,
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
