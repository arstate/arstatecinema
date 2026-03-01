import { useRef } from 'react';
import SmoothScroll from './components/SmoothScroll';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import MainLanding from './components/MainLanding';
import PortfolioShowcase from './components/PortfolioShowcase';
import PageTransition, { PageTransitionRef } from './components/PageTransition';

export default function App() {
  const transitionRef = useRef<PageTransitionRef>(null);

  const handleProjectClick = () => {
    transitionRef.current?.trigger();
  };

  return (
    <SmoothScroll>
      <PageTransition ref={transitionRef} />
      <Navbar />
      
      <main className="relative bg-black min-h-screen">
        <Hero />
        <MainLanding />
        
        <PortfolioShowcase />

        {/* Call to Action */}
        <section className="relative py-40 w-full flex flex-col items-center justify-center bg-black px-10">
          <h2 className="text-4xl md:text-7xl font-display font-bold tracking-tighter text-center mb-10">
            READY TO CAPTURE <br />
            <span className="text-accent italic">YOUR STORY?</span>
          </h2>
          <button 
            onClick={handleProjectClick}
            className="group relative px-10 py-4 border border-white/20 rounded-full overflow-hidden transition-colors hover:border-accent"
          >
            <span className="relative z-10 font-mono text-xs uppercase tracking-widest group-hover:text-white">
              Start a Project
            </span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
          </button>
        </section>

        {/* Footer / Contact */}
        <footer className="relative h-[50vh] w-full flex flex-col items-center justify-center bg-black px-10">
          <div className="w-full h-[1px] bg-white/10 mb-20" />
          <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-10">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest opacity-40 mb-4">Contact</h3>
              <p className="text-lg font-display">hello@arstate.cinema</p>
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase tracking-widest opacity-40 mb-4">Social</h3>
              <div className="flex gap-6">
                <a href="#" className="text-lg font-display hover:text-accent transition-colors">Instagram</a>
                <a href="#" className="text-lg font-display hover:text-accent transition-colors">Vimeo</a>
              </div>
            </div>
            <div className="flex flex-col items-end justify-end">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-20">
                © 2026 ARSTATE.CINEMA
              </p>
            </div>
          </div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
