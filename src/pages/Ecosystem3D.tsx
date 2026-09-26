// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Cloud, Environment, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trees, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

function Tree({ pos, scale = 1 }: any) {
  return (
    <group position={pos}>
      {/* trunk */}
      <mesh position={[0, 0.4 * scale, 0]} castShadow>
        <cylinderGeometry args={[0.08 * scale, 0.12 * scale, 0.8 * scale, 8]} />
        <meshStandardMaterial color="#5b3a1a" roughness={0.95} />
      </mesh>
      {/* foliage layers */}
      <mesh position={[0, 1.0 * scale, 0]} castShadow>
        <coneGeometry args={[0.5 * scale, 0.7 * scale, 8]} />
        <meshStandardMaterial color="#1f7a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.4 * scale, 0]} castShadow>
        <coneGeometry args={[0.4 * scale, 0.6 * scale, 8]} />
        <meshStandardMaterial color="#2a8d44" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7 * scale, 0]} castShadow>
        <coneGeometry args={[0.3 * scale, 0.5 * scale, 8]} />
        <meshStandardMaterial color="#36a04f" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Animal({ pos, color, size = 0.18, type = "deer" }: any) {
  const ref = useRef<THREE.Group>(null);
  const dir = useRef(new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize());
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dir.current.x * dt * 0.5;
    ref.current.position.z += dir.current.z * dt * 0.5;
    if (Math.abs(ref.current.position.x) > 6 || Math.abs(ref.current.position.z) > 6) {
      dir.current.negate();
    }
    ref.current.rotation.y = Math.atan2(dir.current.x, dir.current.z);
  });
  return (
    <group ref={ref} position={pos}>
      <mesh position={[0, size, 0]} castShadow>
        <boxGeometry args={[size * 0.5, size, size * 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, size * 1.6, size * 0.6]} castShadow>
        <sphereGeometry args={[size * 0.4, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* legs */}
      {[[-0.2, 0.5], [0.2, 0.5], [-0.2, -0.5], [0.2, -0.5]].map(([x, z], i) => (
        <mesh key={i} position={[x * size, size * 0.3, z * size] as any} castShadow>
          <cylinderGeometry args={[size * 0.08, size * 0.08, size * 0.6, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Pond() {
  return (
    <mesh position={[3, 0.01, -2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[1.5, 32]} />
      <meshPhysicalMaterial color="#4a9bd1" roughness={0.05} metalness={0.4} clearcoat={1} />
    </mesh>
  );
}

const Ecosystem3D = () => {
  const [time, setTime] = useState(0.4); // 0-1 day cycle
  const [showAnimals, setShowAnimals] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const trees = useMemo(() => {
    const arr: any[] = [];
    for (let i = 0; i < 25; i++) {
      const r = 2 + Math.random() * 5;
      const a = Math.random() * Math.PI * 2;
      arr.push({ pos: [Math.cos(a) * r, 0, Math.sin(a) * r], scale: 0.7 + Math.random() * 0.6 });
    }
    return arr;
  }, []);

  const sunY = Math.sin(time * Math.PI) * 8;
  const sunX = Math.cos(time * Math.PI) * 8;
  const isNight = time < 0.05 || time > 0.95;

  const concepts = [
    { id: "producers", title: "Producers", desc: "Trees and plants — convert sunlight into energy through photosynthesis." },
    { id: "primary", title: "Primary Consumers", desc: "Herbivores like deer and rabbits eat plants for energy." },
    { id: "secondary", title: "Secondary Consumers", desc: "Carnivores like foxes hunt herbivores." },
    { id: "decomposers", title: "Decomposers", desc: "Fungi and bacteria break down dead matter, recycling nutrients." },
    { id: "water", title: "Water Cycle", desc: "Pond water evaporates, forms clouds, and returns as rain." },
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-[10px]"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <Trees className="h-4 w-4 text-green-500" />
          <h1 className="text-sm font-semibold">Forest Ecosystem Lab</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {isNight ? <Moon className="h-3.5 w-3.5 text-blue-300" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          <span className="text-[10px] font-mono">{Math.round(time * 24)}:00</span>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 4, 10], fov: 55 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={55} />
          <color attach="background" args={[isNight ? "#0a0a2a" : "#87ceeb"]} />
          <fog attach="fog" args={[isNight ? "#0a0a2a" : "#bce4ff", 15, 35]} />
          <ambientLight intensity={isNight ? 0.15 : 0.5} />
          <directionalLight position={[sunX, Math.abs(sunY) + 2, 5]} intensity={isNight ? 0.3 : 2} castShadow shadow-mapSize={2048} color={isNight ? "#aabbff" : "#fff5e6"} />
          {!isNight && <Sky distance={450000} sunPosition={[sunX, sunY, 5]} inclination={0.5} azimuth={0.25} />}

          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#3d5a2e" roughness={1} />
          </mesh>

          {/* Trees */}
          {trees.map((t, i) => <Tree key={i} pos={t.pos} scale={t.scale} />)}

          {/* Pond */}
          <Pond />

          {/* Animals */}
          {showAnimals && (
            <>
              <Animal pos={[1, 0, 1]} color="#a0784f" size={0.2} />
              <Animal pos={[-2, 0, 2]} color="#a0784f" size={0.2} />
              <Animal pos={[3, 0, 0]} color="#d4d4d4" size={0.13} />
              <Animal pos={[-3, 0, -1]} color="#c47a4a" size={0.16} />
            </>
          )}

          {/* Clouds */}
          {!isNight && (
            <>
              <Cloud position={[-4, 6, -5]} speed={0.2} opacity={0.6} />
              <Cloud position={[4, 7, -3]} speed={0.2} opacity={0.5} />
            </>
          )}

          <OrbitControls enablePan enableZoom minDistance={4} maxDistance={20} maxPolarAngle={Math.PI / 2.1} target={[0, 1, 0]} />
        </Canvas>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 left-4 glass-card p-3 space-y-3 w-52">
          <div className="flex items-center gap-2 pb-1 border-b border-border/40">
            <Trees className="h-3.5 w-3.5 text-green-500" />
            <span className="text-[11px] font-bold">Ecosystem</span>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Time of day</span>
              <span className="font-mono">{Math.round(time * 24)}:00</span>
            </div>
            <Slider value={[time]} onValueChange={(v) => setTime(v[0])} min={0} max={1} step={0.01} />
          </div>
          <div className="flex items-center justify-between text-[11px]"><span>Animals</span><Switch checked={showAnimals} onCheckedChange={setShowAnimals} /></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-3 py-2 flex items-center gap-1.5 max-w-[90vw] overflow-x-auto">
          {concepts.map((c) => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${selected === c.id ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary"}`}>{c.title}</button>
          ))}
        </motion.div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-4 right-4 w-64 glass-card p-3">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold">{concepts.find((c) => c.id === selected)?.title}</h3>
                <button onClick={() => setSelected(null)} className="text-muted-foreground text-xs">✕</button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{concepts.find((c) => c.id === selected)?.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AIExplainPanel context={`Forest ecosystem at ${Math.round(time * 24)}:00. ${selected ? `Studying: ${concepts.find((c) => c.id === selected)?.title}` : "Trees, animals, and water cycle interactions."}`} subject="Forest Ecosystem" />
    </div>
  );
};

export default Ecosystem3D;
