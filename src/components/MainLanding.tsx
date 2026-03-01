import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function MainLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(textRef.current?.children || [], 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          stagger: 0.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black px-6 pt-20 z-20">
      <div ref={textRef} className="text-center max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="text-xs md:text-sm font-mono uppercase tracking-[0.5em] text-accent mb-8">
          The Main Stage
        </h2>
        
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tighter text-white mb-8 leading-[0.9]">
          WE CRAFT <br />
          <span className="font-serif italic font-light opacity-90">CINEMATIC</span> <br />
          EXPERIENCES
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 font-sans max-w-2xl mx-auto leading-relaxed mt-8">
          ARSTATE is a premier creative studio specializing in high-end commercial video production, immersive storytelling, and breathtaking visual arts.
        </p>
        
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="px-8 py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-colors">
            View Our Work
          </button>
          <button className="px-8 py-4 border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:border-white transition-colors">
            About Studio
          </button>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] mb-4 text-white">Discover</p>
        <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
