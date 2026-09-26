// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

const LOBES = [
  { id: "frontal", name: "Frontal Lobe", color: "#ef4444", pos: [0, 0.4, 0.9], scale: [1.1, 0.9, 0.7], desc: "Reasoning, planning, voluntary movement, speech (Broca's area)." },
  { id: "parietal", name: "Parietal Lobe", color: "#3b82f6", pos: [0, 0.85, -0.1], scale: [1.0, 0.7, 0.8], desc: "Touch, temperature, pain perception, spatial awareness." },
  { id: "temporal", name: "Temporal Lobe", color: "#10b981", pos: [0.85, 0.0, 0.1], scale: [0.6, 0.6, 1.0], desc: "Hearing, memory, language comprehension (Wernicke's area)." },
  { id: "temporal2", name: "Temporal (L)", color: "#10b981", pos: [-0.85, 0.0, 0.1], scale: [0.6, 0.6, 1.0], desc: "Hearing, memory, language comprehension (Wernicke's area)." },
  { id: "occipital", name: "Occipital Lobe", color: "#f59e0b", pos: [0, 0.4, -1.05], scale: [0.9, 0.8, 0.5], desc: "Visual processing — interprets signals from the eyes." },
  { id: "cerebellum", name: "Cerebellum", color: "#a855f7", pos: [0, -0.5, -0.7], scale: [0.9, 0.5, 0.6], desc: "Coordinates movement, balance, and motor learning." },
  { id: "brainstem", name: "Brain Stem", color: "#94a3b8", pos: [0, -1.0, -0.2], scale: [0.3, 0.6, 0.3], desc: "Controls breathing, heart rate, blood pressure, and connects brain to spinal cord." },
];

function BrainModel({ selected, onSelect, showLabels, neurons }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05; });

  // Realistic-ish brain: deformed sphere with deep central fissure + many gyri bumps
  return (
    <group ref={ref}>
      {/* Left hemisphere */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.55, 0.2, 0]}>
          <mesh scale={[1.0, 1.0, 1.25]}>
            <sphereGeometry args={[0.95, 64, 64]} />
            <meshPhysicalMaterial color="#e8a8a8" roughness={0.65} clearcoat={0.6} clearcoatRoughness={0.5} sheen={0.6} sheenColor="#ffb3b3" />
          </mesh>
          {/* gyri bumps */}
          {[...Array(60)].map((_, i) => {
            const u = Math.random() * Math.PI * 2;
            const v = Math.acos(2 * Math.random() - 1);
            const r = 0.95;
            const px = Math.sin(v) * Math.cos(u) * r;
            const py = Math.cos(v) * r;
            const pz = Math.sin(v) * Math.sin(u) * r * 1.25;
            if (side === -1 && px > -0.05) return null;
            if (side === 1 && px < 0.05) return null;
            return (
              <mesh key={i} position={[px, py, pz]} scale={0.12 + Math.random() * 0.1}>
                <sphereGeometry args={[1, 10, 10]} />
                <meshPhysicalMaterial color="#dc8e8e" roughness={0.85} sheen={0.4} sheenColor="#f7a3a3" />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Lobe selectable highlights (transparent overlay regions) */}
      {LOBES.filter((l) => l.id !== "temporal2").map((l) => (
        <group key={l.id} position={l.pos as any}>
          <mesh
            scale={l.scale as any}
            onClick={(e) => { e.stopPropagation(); onSelect(l); }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "auto")}
          >
            <sphereGeometry args={[0.55, 24, 24]} />
            <meshPhysicalMaterial
              color={l.color}
              transparent
              opacity={selected?.id === l.id ? 0.55 : 0.0}
              emissive={l.color}
              emissiveIntensity={selected?.id === l.id ? 0.5 : 0}
            />
          </mesh>
          {showLabels && (
            <Html center distanceFactor={6}>
              <div className="px-1.5 py-0.5 rounded bg-background/85 text-[9px] font-semibold whitespace-nowrap pointer-events-none border border-border">{l.name}</div>
            </Html>
          )}
        </group>
      ))}

      {/* Cerebellum */}
      <mesh position={[0, -0.55, -0.6]} scale={[0.95, 0.5, 0.6]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshPhysicalMaterial color="#c08585" roughness={0.7} sheen={0.5} sheenColor="#e6a3a3" />
      </mesh>

      {/* Brainstem */}
      <mesh position={[0, -1.0, -0.2]}>
        <cylinderGeometry args={[0.12, 0.18, 0.7, 16]} />
        <meshPhysicalMaterial color="#b08080" roughness={0.6} />
      </mesh>

      {/* Neural firing particles */}
      {neurons && [...Array(50)].map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 2.5,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2.4,
        ]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

const HumanBrain3D = () => {
  const [selected, setSelected] = useState<any>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [neurons, setNeurons] = useState(true);

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-[10px]"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <Brain className="h-4 w-4 text-pink-400" />
          <h1 className="text-sm font-semibold">Human Brain Lab</h1>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 4.5] }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0a0612"]} />
          <fog attach="fog" args={["#0a0612", 8, 18]} />
          <ambientLight intensity={0.3} />
          <directionalLight position={[3, 4, 4]} intensity={2} castShadow />
          <pointLight position={[-3, 1, 2]} intensity={0.8} color="#ff88aa" />
          <BrainModel selected={selected} onSelect={setSelected} showLabels={showLabels} neurons={neurons} />
          <OrbitControls enablePan enableZoom minDistance={2} maxDistance={10} enableDamping />
          <Environment preset="studio" />
        </Canvas>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 left-4 glass-card p-3 space-y-2 w-44">
          <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
            <Brain className="h-3.5 w-3.5 text-pink-400" />
            <span className="text-[11px] font-bold">Brain View</span>
          </div>
          <div className="flex items-center justify-between text-[11px]"><span>Labels</span><Switch checked={showLabels} onCheckedChange={setShowLabels} /></div>
          <div className="flex items-center justify-between text-[11px]"><span>Neural firing</span><Switch checked={neurons} onCheckedChange={setNeurons} /></div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-3 py-2 flex items-center gap-1.5 max-w-[90vw] overflow-x-auto">
          {LOBES.filter((l) => l.id !== "temporal2").map((l) => (
            <button key={l.id} onClick={() => setSelected(l)} className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${selected?.id === l.id ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary"}`}>{l.name}</button>
          ))}
        </motion.div>

        <AnimatePresence>
          {selected && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-4 right-4 w-64 glass-card p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full" style={{ background: selected.color }} /><h3 className="text-sm font-bold">{selected.name}</h3></div>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground text-xs">✕</button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{selected.desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AIExplainPanel context={selected ? `Viewing ${selected.name}: ${selected.desc}` : "Exploring the human brain — lobes and structures"} subject="Human Brain" />
    </div>
  );
};

export default HumanBrain3D;
