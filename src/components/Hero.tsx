import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Image, Float, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CLOUD_COUNT = 60;

function DoubleSidedPhoto({ url, isSelected, isAnySelected, onSelect, item, ...props }: any) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (hovered && !isSelected && !isAnySelected) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => { document.body.style.cursor = 'default'; };
  }, [hovered, isSelected, isAnySelected]);

  const opacity = isSelected ? 1 : (isAnySelected ? 0.1 : 1);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    if (isSelected) {
      const parent = groupRef.current.parent;
      if (parent) {
        const targetWorldQuaternion = camera.quaternion.clone();
        const parentWorldQuaternion = new THREE.Quaternion();
        parent.getWorldQuaternion(parentWorldQuaternion);
        const targetLocalQuaternion = parentWorldQuaternion.invert().multiply(targetWorldQuaternion);
        groupRef.current.quaternion.slerp(targetLocalQuaternion, 0.1);
      }
    }

    if (glowMaterialRef.current && glowMeshRef.current) {
      const targetOpacity = (hovered && !isSelected && !isAnySelected) ? 1 : 0;
      glowMaterialRef.current.opacity = THREE.MathUtils.lerp(glowMaterialRef.current.opacity, targetOpacity, 0.15);
      
      const targetScale = (hovered && !isSelected && !isAnySelected) ? 1.04 : 1.0;
      glowMeshRef.current.scale.setScalar(THREE.MathUtils.lerp(glowMeshRef.current.scale.x, targetScale, 0.15));
    }
  });

  return (
    <group 
      ref={groupRef}
      {...props} 
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        if (e.button === 0) { // Only respond to left click
          if (isSelected) {
            onSelect(null); // Deselect if already selected
          } else {
            onSelect(item?.id); // Select if not selected
          }
        }
      }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
    >
      {/* Glow Border */}
      <mesh ref={glowMeshRef} position={[0, 0, -0.0025]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          ref={glowMaterialRef}
          color={[2, 2, 2]} 
          transparent 
          opacity={0} 
          toneMapped={false} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Front Side */}
      <Image url={url} transparent opacity={opacity} side={THREE.FrontSide} />
      {/* Back Side */}
      <Image 
        url={url} 
        rotation={[0, Math.PI, 0]} 
        position={[0, 0, -0.005]} 
        transparent 
        opacity={opacity * 0.9} 
        color="#888"
        side={THREE.FrontSide} 
      />
    </group>
  );
}

function PhotoCloud({ scrollProgress, selectedId, setSelectedId, onFocusPosChange }: { scrollProgress: { value: number }, selectedId: number | null, setSelectedId: (id: number | null) => void, onFocusPosChange: (pos: THREE.Vector3 | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const items = useMemo(() => {
    return Array.from({ length: CLOUD_COUNT }).map((_, i) => ({
      id: i,
      url: `https://picsum.photos/seed/arstate-${i}/600/800`,
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      rotation: [
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * Math.PI,
        (Math.random() - 0.5) * 0.2,
      ] as [number, number, number],
      scale: 0.8 + Math.random() * 1.5,
    }));
  }, []);

  const cameraTargetPos = useRef(new THREE.Vector3(0, 0, 15));
  const cameraLookAtPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    const targetRotY = time * 0.05 + scrollProgress.value * 2;
    const targetRotX = Math.sin(time * 0.1) * 0.1;
    const targetPosZ = scrollProgress.value * 20;
    const targetScale = 1 + scrollProgress.value * 2;

    if (selectedId === null) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetPosZ, 0.05);
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05));
      
      cameraTargetPos.current.set(0, 0, 15);
      cameraLookAtPos.current.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      onFocusPosChange(null);
    } else {
      const selectedItem = items.find(item => item.id === selectedId);
      if (selectedItem) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y, 0.1);
        
        const worldPos = new THREE.Vector3(...selectedItem.position);
        worldPos.applyMatrix4(groupRef.current.matrixWorld);
        
        const cameraOffset = new THREE.Vector3(0, 0, 4);
        cameraTargetPos.current.copy(worldPos).add(cameraOffset);
        cameraLookAtPos.current.lerp(worldPos, 0.1);
        onFocusPosChange(worldPos);
      }
    }

    camera.position.lerp(cameraTargetPos.current, 0.08);
    camera.lookAt(cameraLookAtPos.current);
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <Float 
          key={i} 
          speed={selectedId === item.id ? 0 : 1.5} 
          rotationIntensity={selectedId === item.id ? 0 : 0.5} 
          floatIntensity={selectedId === item.id ? 0 : 0.5}
        >
          <DoubleSidedPhoto
            url={item.url}
            position={item.position}
            rotation={item.rotation}
            scale={item.scale}
            isSelected={selectedId === item.id}
            isAnySelected={selectedId !== null}
            item={item}
            onSelect={(id: number | null) => setSelectedId(id)}
          />
        </Float>
      ))}
    </group>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef({ value: 0 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focusPos, setFocusPos] = useState<THREE.Vector3 | null>(null);
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Handle scroll up / swipe down to deselect when at the top of the page
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (selectedIdRef.current !== null && e.deltaY < 0) {
        setSelectedId(null);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (selectedIdRef.current !== null) {
        const touchY = e.touches[0].clientY;
        if (touchY > touchStartY + 10) { // Swiping down (scrolling up)
          setSelectedId(null);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdRef.current !== null) {
        if (e.key === 'Escape' || e.key === 'ArrowUp' || e.key === 'PageUp') {
          setSelectedId(null);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            scrollProgress.current.value = self.progress;
            
            if (self.progress > 0.05 && selectedIdRef.current !== null) {
              setSelectedId(null);
            }
            
            if (self.direction === -1 && selectedIdRef.current !== null) {
              setSelectedId(null);
            }
          },
        },
      });

      tl.to(canvasContainerRef.current, {
        opacity: 0,
        scale: 2,
        duration: 1,
        ease: 'power2.in',
      })
      .fromTo(titleRef.current?.querySelectorAll('span'),
        { y: '100%' },
        { y: '0%', duration: 1, stagger: 0.15, ease: 'power4.out' },
        '-=0.5'
      )
      .fromTo(titleRef.current?.nextElementSibling,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
        '-=0.8'
      )
      .fromTo(videoContainerRef.current, 
        { clipPath: 'inset(50% 0% 50% 0%)', scale: 1.1 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.5, ease: 'power3.inOut' },
        '+=0.2'
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full overflow-hidden bg-black"
      onWheel={(e) => {
        if (selectedId !== null && e.deltaY < 0) {
          setSelectedId(null);
        }
      }}
    >
      {/* 3D Photo Cloud Layer */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-20">
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <PhotoCloud 
            scrollProgress={scrollProgress.current} 
            selectedId={selectedId} 
            setSelectedId={setSelectedId} 
            onFocusPosChange={setFocusPos}
          />
          
          <EffectComposer>
            <Bloom luminanceThreshold={1} intensity={0.5} radius={0.4} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            {selectedId !== null && focusPos && (
              <DepthOfField 
                target={focusPos}
                focalLength={0.05} 
                bokehScale={15} 
                height={720} 
              />
            )}
          </EffectComposer>
        </Canvas>
        
        {/* Initial Instruction */}
        {selectedId === null && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
            <div className="w-px h-12 bg-white/20 mb-4 animate-bounce" />
            <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-40">Scroll to Enter or Click a Photo</p>
          </div>
        )}
      </div>

      {/* Landing Page Text Layer */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pointer-events-none">
        <h1 ref={titleRef} className="text-6xl md:text-9xl font-display font-bold tracking-tighter text-center text-white">
          <div className="overflow-hidden">
            <span className="inline-block">ARSTATE.</span>
          </div>
          <div className="overflow-hidden">
            <span className="inline-block">CINEMA</span>
          </div>
        </h1>

        <div className="absolute bottom-10 right-10 flex flex-col items-end">
          <p className="font-serif italic text-sm opacity-60 tracking-widest uppercase text-white">Est. 2020</p>
          <div className="w-12 h-[1px] bg-white/30 mt-2" />
        </div>
      </div>

      {/* Video Background Layer */}
      <div ref={videoContainerRef} className="absolute inset-0 z-30 overflow-hidden bg-black">
        <iframe
          src="https://www.youtube.com/embed/0m5dw-TEGb8?autoplay=1&mute=1&loop=1&playlist=0m5dw-TEGb8&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] pointer-events-none scale-[1.3]"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Viewfinder Frame */}
      <div className="absolute inset-0 z-40 pointer-events-none border-[20px] border-transparent">
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/20" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/20" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/20" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/20" />
      </div>
    </section>
  );
}
