import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PageTransitionRef {
  trigger: () => void;
}

const PageTransition = forwardRef<PageTransitionRef>((props, ref) => {
  const [isActive, setIsActive] = useState(false);

  useImperativeHandle(ref, () => ({
    trigger: () => {
      setIsActive(true);
      setTimeout(() => setIsActive(false), 1000);
    },
  }));

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center overflow-hidden"
        >
          {/* Intense Flash */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 4, opacity: 1 }}
            exit={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full h-full bg-white mix-blend-overlay"
          />

          {/* Light Leak Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-tr from-orange-600/40 via-red-600/20 to-transparent mix-blend-screen"
          />

          {/* Film Grain / Noise */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;
