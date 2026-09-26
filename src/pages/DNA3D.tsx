// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Info, Pause, Play, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

type Mode = "structure" | "replication" | "transcription";

const baseColors = { A: "#EF4444", T: "#3B82F6", G: "#10B981", C: "#F59E0B", U: "#A855F7" };

const sequence = ["A","T","G","C","A","G","T","A","C","G","T","A","C","G","T","A","G","C","T","A","G","C","A","T"];
const complement = (b: string) => ({ A: "T", T: "A", G: "C", C: "G" }[b] || "U");

function DNAHelix({ selectedPair, onSelectPair, paused, splitProgress, mode }: { selectedPair: number | null; onSelectPair: (i: number | null) => void; paused: boolean; splitProgress: number; mode: Mode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (groupRef.current && !paused) groupRef.current.rotation.y += delta * 0.3; });

  const helixRadius = 1.2;
  const verticalSpacing = 0.55;

  return (
    <group ref={groupRef}>
      {sequence.map((base, i) => {
        const angle = (i / sequence.length) * Math.PI * 5;
        const y = (i - sequence.length / 2) * verticalSpacing;
        const isSelected = selectedPair === i;

        // Splitting effect (replication / transcription)
        const splitOffset = mode !== "structure" ? splitProgress * (i < sequence.length / 2 ? 1.2 : 0) : 0;

        const lx = Math.cos(angle) * helixRadius - splitOffset;
        const lz = Math.sin(angle) * helixRadius;
        const rx = Math.cos(angle + Math.PI) * helixRadius + splitOffset;
        const rz = Math.sin(angle + Math.PI) * helixRadius;

        const compBase = complement(base);
        const showRNA = mode === "transcription" && i < sequence.length / 2 && splitProgress > 0.3;

        return (
          <group key={i}>
            {/* Left backbone (sugar-phosphate) */}
            <mesh position={[lx, y, lz]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshPhysicalMaterial color={baseColors[base as keyof typeof baseColors]} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} emissive={baseColors[base as keyof typeof baseColors]} emissiveIntensity={isSelected ? 0.7 : 0.1} />
            </mesh>
            {/* Right backbone */}
            <mesh position={[rx, y, rz]}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshPhysicalMaterial color={baseColors[compBase as keyof typeof baseColors]} roughness={0.2} clearcoat={1} clearcoatRoughness={0.1} emissive={baseColors[compBase as keyof typeof baseColors]} emissiveIntensity={isSelected ? 0.7 : 0.1} />
            </mesh>
            {/* Hydrogen bond rungs */}
            {(mode === "structure" || splitProgress < 0.05 || i >= sequence.length / 2) && (
              <mesh
                position={[(lx + rx) / 2, y, (lz + rz) / 2]}
                onClick={(e) => { e.stopPropagation(); onSelectPair(isSelected ? null : i); }}
                rotation={[0, -angle, 0]}
              >
                <cylinderGeometry args={[0.04, 0.04, helixRadius * 2 - splitOffset * 2, 8]} />
                <meshPhysicalMaterial
                  color={isSelected ? "#FFFFFF" : "#cbd5e1"}
                  transparent opacity={isSelected ? 1 : 0.5}
                  roughness={0.3} metalness={0.4}
                  emissive={isSelected ? "#ffffff" : "#000"}
                  emissiveIntensity={isSelected ? 0.3 : 0}
                />
              </mesh>
            )}

            {/* RNA strand (transcription) */}
            {showRNA && (
              <mesh position={[lx + 0.5, y, lz]}>
                <sphereGeometry args={[0.13, 16, 16]} />
                <meshPhysicalMaterial color={baseColors.U} emissive={baseColors.U} emissiveIntensity={0.5} clearcoat={1} />
              </mesh>
            )}

            {/* Backbone connectors */}
            {i < sequence.length - 1 && (
              <>
                <mesh position={[(lx + Math.cos(((i + 1) / sequence.length) * Math.PI * 5) * helixRadius - splitOffset) / 2, y + verticalSpacing / 2, (lz + Math.sin(((i + 1) / sequence.length) * Math.PI * 5) * helixRadius) / 2]}>
                  <cylinderGeometry args={[0.06, 0.06, verticalSpacing * 1.2, 8]} />
                  <meshPhysicalMaterial color="#94a3b8" opacity={0.55} transparent roughness={0.3} metalness={0.3} />
                </mesh>
                <mesh position={[(rx + Math.cos(((i + 1) / sequence.length) * Math.PI * 5 + Math.PI) * helixRadius + splitOffset) / 2, y + verticalSpacing / 2, (rz + Math.sin(((i + 1) / sequence.length) * Math.PI * 5 + Math.PI) * helixRadius) / 2]}>
                  <cylinderGeometry args={[0.06, 0.06, verticalSpacing * 1.2, 8]} />
                  <meshPhysicalMaterial color="#94a3b8" opacity={0.55} transparent roughness={0.3} metalness={0.3} />
                </mesh>
              </>
            )}

            {isSelected && (
              <Html position={[(lx + rx) / 2, y + 0.3, (lz + rz) / 2]} center style={{ pointerEvents: "none" }}>
                <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 w-52 shadow-lg">
                  <p className="text-xs font-bold">Base Pair {i + 1}</p>
                  <p className="text-[12px] mt-1">
                    <span style={{ color: baseColors[base as keyof typeof baseColors] }} className="font-bold">{base}</span>
                    {" — "}
                    <span style={{ color: baseColors[compBase as keyof typeof baseColors] }} className="font-bold">{compBase}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {(base === "A" || base === "T") ? "A-T: 2 hydrogen bonds (weaker)" : "G-C: 3 hydrogen bonds (stronger)"}
                  </p>
                </div>
              </Html>
            )}
          </group>
        );
      })}
      <Sparkles count={50} scale={[5, 14, 5]} size={2} speed={0.2} color="#60a5fa" />
    </group>
  );
}

const DNA3D = () => {
  const [selectedPair, setSelectedPair] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<Mode>("structure");
  const [splitProgress, setSplitProgress] = useState(0);

  // Animate split when mode changes
  useEffect(() => {
    if (mode === "structure") { setSplitProgress(0); return; }
    let frame: number;
    let start = performance.now();
    const animate = () => {
      const t = (performance.now() - start) / 2000;
      setSplitProgress(Math.min(t, 1));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    setSplitProgress(0);
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [mode]);

  const modeInfo: Record<Mode, string> = {
    structure: "DNA's double helix — Watson & Crick's 1953 discovery. Two antiparallel strands held by hydrogen bonds.",
    replication: "DNA polymerase unzips the helix at the replication fork. Each strand templates a new complementary strand (semi-conservative).",
    transcription: "RNA polymerase reads one strand to synthesize messenger RNA (mRNA). T is replaced by U in RNA. mRNA carries the code to ribosomes.",
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-sm font-bold truncate">DNA Lab</h1>
        <Badge className="text-[10px] hidden sm:inline-flex" variant="secondary">{mode}</Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => { setSelectedPair(null); setMode("structure"); }}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 14, 28]} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-3, -3, 3]} intensity={0.5} color="#818cf8" />
          <spotLight position={[0, 8, 0]} angle={0.4} penumbra={1} intensity={2.5} color="#e0e7ff" />
          <pointLight position={[0, -5, 3]} intensity={0.6} color="#60a5fa" />
          <DNAHelix selectedPair={selectedPair} onSelectPair={setSelectedPair} paused={paused} splitProgress={splitProgress} mode={mode} />
          <mesh position={[0, -7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 40]} />
            <meshPhysicalMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
          </mesh>
          <OrbitControls enablePan enableZoom minDistance={4} maxDistance={18} />
          <Environment preset="night" />
        </Canvas>

        {/* Mode selector */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 sm:p-2">
          {(["structure", "replication", "transcription"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all capitalize ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {m === "replication" && <Scissors className="h-3 w-3 mr-1 inline" />}
              {m}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-64 max-w-[calc(100%-1.5rem)] glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold capitalize">{mode}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{modeInfo[mode]}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
            {Object.entries(baseColors).map(([base, color]) => (
              <div key={base} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-semibold">{base}</span>
                <span className="text-muted-foreground">
                  {base === "A" ? "Adenine" : base === "T" ? "Thymine" : base === "G" ? "Guanine" : base === "C" ? "Cytosine" : "Uracil (RNA)"}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground/80 pt-2 border-t border-border/30">
            Sequence: <span className="font-mono">{sequence.join("")}</span>
          </div>
        </motion.div>
      </div>
      <AIExplainPanel
        context={`DNA Lab — mode: ${mode}. ${modeInfo[mode]} ${selectedPair !== null ? `Selected pair ${selectedPair + 1}: ${sequence[selectedPair]}-${complement(sequence[selectedPair])}.` : ""}`}
        subject="DNA & Genetics"
      />
    </div>
  );
};

export default DNA3D;
