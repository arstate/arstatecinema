import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Hero section is 100vh + 300% pin = 400vh total.
    // We want the navbar to appear right as we enter the MainLanding section.
    if (latest > window.innerHeight * 3.5) {
      setHidden(false);
    } else {
      setHidden(true);
    }
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      initial="hidden"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent text-white"
    >
      <div className="font-display font-bold text-2xl tracking-tighter">
        ARSTATE<span className="text-accent">.</span>
      </div>
      <div className="hidden md:flex gap-10 font-mono text-xs uppercase tracking-widest">
        <a href="#home" className="hover:text-accent transition-colors">Home</a>
        <a href="#work" className="hover:text-accent transition-colors">Work</a>
        <a href="#about" className="hover:text-accent transition-colors">About</a>
        <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
      </div>
      <button className="md:hidden font-mono text-xs uppercase tracking-widest hover:text-accent transition-colors">
        Menu
      </button>
    </motion.nav>
  );
}
