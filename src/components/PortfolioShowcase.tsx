import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PORTFOLIO_ITEMS = [
  { id: 1, url: 'https://picsum.photos/seed/wedding1/800/1200', title: 'Eternal Vows', category: 'Wedding' },
  { id: 2, url: 'https://picsum.photos/seed/wedding2/800/1200', title: 'Golden Hour', category: 'Pre-Wedding' },
  { id: 3, url: 'https://picsum.photos/seed/wedding3/800/1200', title: 'Urban Love', category: 'Event' },
  { id: 4, url: 'https://picsum.photos/seed/wedding4/800/1200', title: 'Midnight Waltz', category: 'Wedding' },
  { id: 5, url: 'https://picsum.photos/seed/wedding5/800/1200', title: 'Desert Rose', category: 'Pre-Wedding' },
  { id: 6, url: 'https://picsum.photos/seed/wedding6/800/1200', title: 'Vintage Soul', category: 'Event' },
];

function PortfolioItem({ index, url, title, category, total, ...props }: any) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  const angle = (index / total) * Math.PI * 2;
  const radius = 6;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.getElapsedTime();
    ref.current.position.y = Math.sin(time + index) * 0.1;
    ref.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={ref} {...props} position={[x, 0, z]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Image
          url={url}
          scale={[2.8, 4]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          transparent
          opacity={hovered ? 1 : 0.6}
        />
        <Text
          position={[0, -2.4, 0.1]}
          fontSize={0.25}
          anchorX="center"
          anchorY="middle"
          color="white"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {title.toUpperCase()}
        </Text>
        <Text
          position={[0, -2.8, 0.1]}
          fontSize={0.12}
          anchorX="center"
          anchorY="middle"
          color="#ff0000"
          fillOpacity={0.6}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {category}
        </Text>
      </Float>
    </group>
  );
}

function Carousel({ scrollProgress }: { scrollProgress: { value: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    // Smoothly interpolate rotation
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      scrollProgress.value * Math.PI * 2,
      0.1
    );
  });

  return (
    <group ref={groupRef}>
      {PORTFOLIO_ITEMS.map((item, i) => (
        <PortfolioItem
          key={item.id}
          index={i}
          total={PORTFOLIO_ITEMS.length}
          url={item.url}
          title={item.title}
          category={item.category}
        />
      ))}
    </group>
  );
}

export default function PortfolioShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef({ value: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          scrollProgress.current.value = self.progress;
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full bg-zinc-950">
      <div className="absolute inset-0 h-screen w-full">
        <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Carousel scrollProgress={scrollProgress.current} />
        </Canvas>

        {/* Overlay UI */}
        <div className="absolute top-20 left-20 pointer-events-none">
          <h2 className="text-xs font-mono uppercase tracking-[0.5em] opacity-40">Portfolio</h2>
          <p className="text-4xl font-display mt-4 italic">The Collection</p>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <div className="w-[1px] h-24 bg-gradient-to-b from-white/20 to-transparent" />
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-20 mt-6">Scroll to Rotate Gallery</p>
        </div>

        {/* Viewfinder corners for the showcase too */}
        <div className="absolute inset-20 z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-white/10" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-white/10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-white/10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-white/10" />
        </div>
      </div>
    </section>
  );
}
