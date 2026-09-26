// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { ArrowLeft, Info, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import AIExplainPanel from "@/components/3d/AIExplainPanel";
import * as THREE from "three";

type Phase = "interphase" | "prophase" | "metaphase" | "anaphase" | "telophase";

const phaseInfo: Record<Phase, { label: string; description: string; details: string; color: string }> = {
  interphase: { label: "Interphase", color: "#4ade80",
    description: "Cell grows and DNA replicates. Chromatin loose.",
    details: "G1: cell grows. S: DNA replicated (chromosomes become 2 sister chromatids). G2: prep for mitosis. ~90% of cell life is here.",
  },
  prophase: { label: "Prophase", color: "#facc15",
    description: "Chromosomes condense. Spindle fibers form.",
    details: "Chromatin condenses into visible X-shaped chromosomes. Nuclear envelope breaks down. Centrosomes move to opposite poles, forming the mitotic spindle.",
  },
  metaphase: { label: "Metaphase", color: "#60a5fa",
    description: "Chromosomes align at the equator.",
    details: "Spindle fibers attach to centromeres via kinetochores. Chromosomes line up perfectly along the metaphase plate. Spindle assembly checkpoint ensures correct alignment.",
  },
  anaphase: { label: "Anaphase", color: "#f97316",
    description: "Sister chromatids pulled to opposite poles.",
    details: "Centromeres split. Sister chromatids (now individual chromosomes) are pulled by shortening spindle fibers toward opposite poles. Cell elongates.",
  },
  telophase: { label: "Telophase", color: "#c084fc",
    description: "Nuclear envelopes reform. Cell splits.",
    details: "Chromosomes decondense. Two new nuclear envelopes form. Spindle disassembles. Cytokinesis begins — cytoplasm divides via a contractile ring, producing 2 identical daughter cells.",
  },
};

const phaseList: Phase[] = ["interphase", "prophase", "metaphase", "anaphase", "telophase"];

function CellMembrane({ phase }: { phase: Phase }) {
  const ref = useRef<THREE.Mesh>(null);
  const targetScaleX = phase === "telophase" ? 1.5 : phase === "anaphase" ? 1.15 : 1;

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.08;
      ref.current.scale.x = THREE.MathUtils.lerp(ref.current.scale.x, targetScaleX, delta * 1.5);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshTransmissionMaterial
        backside
        thickness={0.3}
        chromaticAberration={0.1}
        anisotropy={0.2}
        distortion={0.1}
        distortionScale={0.2}
        temporalDistortion={0.05}
        color="#a7f3d0"
        transmissionSampler={false}
      />
      {phase === "telophase" && (
        <mesh scale={[0.1, 1.1, 1.1]}>
          <torusGeometry args={[2, 0.1, 16, 64]} />
          <meshPhysicalMaterial color="#34d399" transparent opacity={0.7} clearcoat={1} emissive="#34d399" emissiveIntensity={0.3} />
        </mesh>
      )}
    </mesh>
  );
}

function Nucleus({ phase }: { phase: Phase }) {
  if (phase !== "interphase" && phase !== "telophase") return null;
  if (phase === "telophase") {
    return (
      <>
        {[[-1.2, 0, 0], [1.2, 0, 0]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color="#6366f1" transparent opacity={0.45} roughness={0.15} clearcoat={1} />
          </mesh>
        ))}
      </>
    );
  }
  return (
    <mesh>
      <sphereGeometry args={[0.85, 48, 48]} />
      <meshPhysicalMaterial color="#6366f1" transparent opacity={0.5} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
      <mesh>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshPhysicalMaterial color="#818cf8" clearcoat={1} emissive="#818cf8" emissiveIntensity={0.3} />
      </mesh>
    </mesh>
  );
}

function Chromosome({ position, rotation, color, paired }: { position: [number, number, number]; rotation: [number, number, number]; color: string; paired: boolean }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 8, 16]} />
        <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.8} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      {paired && (
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.07, 0.4, 8, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={0.8} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial color="#fbbf24" clearcoat={1} emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Chromosomes({ phase }: { phase: Phase }) {
  const colors = ["#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

  const chromos = useMemo(() => {
    if (phase === "interphase") return [];
    if (phase === "prophase") {
      return colors.map((c, i) => {
        const angle = (i / colors.length) * Math.PI * 2;
        return { pos: [Math.cos(angle) * 0.7, Math.sin(angle) * 0.5, (Math.random() - 0.5) * 0.3] as [number, number, number],
          rot: [Math.random(), Math.random(), Math.random()] as [number, number, number], color: c, paired: true };
      });
    }
    if (phase === "metaphase") {
      return colors.map((c, i) => ({
        pos: [(i - 2.5) * 0.3, 0, 0] as [number, number, number],
        rot: [0, 0, Math.PI / 2] as [number, number, number], color: c, paired: true,
      }));
    }
    if (phase === "anaphase") {
      return colors.flatMap((c, i) => [
        { pos: [(i - 2.5) * 0.3, 0.9, 0] as [number, number, number], rot: [0, 0, Math.PI / 2] as [number, number, number], color: c, paired: false },
        { pos: [(i - 2.5) * 0.3, -0.9, 0] as [number, number, number], rot: [0, 0, Math.PI / 2] as [number, number, number], color: c, paired: false },
      ]);
    }
    return colors.flatMap((c, i) => [
      { pos: [-1.2 + (i - 2.5) * 0.12, 0, (Math.random() - 0.5) * 0.4] as [number, number, number], rot: [Math.random(), Math.random(), Math.random()] as [number, number, number], color: c, paired: false },
      { pos: [1.2 + (i - 2.5) * 0.12, 0, (Math.random() - 0.5) * 0.4] as [number, number, number], rot: [Math.random(), Math.random(), Math.random()] as [number, number, number], color: c, paired: false },
    ]);
  }, [phase]);

  return (
    <>
      {chromos.map((c, i) => (
        <Float key={`${phase}-${i}`} speed={1.2} floatIntensity={0.05}>
          <Chromosome position={c.pos} rotation={c.rot} color={c.color} paired={c.paired} />
        </Float>
      ))}
    </>
  );
}

function SpindleFibers({ phase }: { phase: Phase }) {
  if (phase !== "metaphase" && phase !== "anaphase") return null;
  return (
    <>
      {[[0, 1.8, 0], [0, -1.8, 0]].map((origin, j) => (
        <mesh key={j} position={origin as [number, number, number]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshPhysicalMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const x = (i - 5.5) * 0.15;
        return (
          <group key={i}>
            <mesh position={[x, 0.9, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 1.8, 6]} />
              <meshPhysicalMaterial color="#a3e635" transparent opacity={0.3} emissive="#a3e635" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[x, -0.9, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 1.8, 6]} />
              <meshPhysicalMaterial color="#a3e635" transparent opacity={0.3} emissive="#a3e635" emissiveIntensity={0.2} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function Scene({ phase }: { phase: Phase }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <hemisphereLight args={["#dbeafe", "#1e1b4b", 0.4]} />
      <pointLight position={[0, 4, 0]} intensity={2.5} color="#e0f2fe" distance={10} />
      <spotLight position={[0, 6, 0]} angle={0.3} penumbra={0.8} intensity={4} color="#bfdbfe" castShadow shadow-mapSize={2048} />
      <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.05} metalness={0.9} />
      </mesh>
      <group>
        <CellMembrane phase={phase} />
        <Nucleus phase={phase} />
        <Chromosomes phase={phase} />
        <SpindleFibers phase={phase} />
      </group>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={10} autoRotate autoRotateSpeed={0.4} />
      <Environment preset="studio" />
    </>
  );
}

const CellDivision3D = () => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [speed, setSpeed] = useState(2.5);
  const phase = phaseList[phaseIdx];

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setPhaseIdx((i) => (i + 1) % phaseList.length), speed * 1000);
    return () => clearInterval(id);
  }, [autoplay, speed]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <FlaskConical className="h-4 w-4 text-green-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Mitosis</h1>
        <Badge className="text-[10px] hidden sm:inline-flex" style={{ backgroundColor: phaseInfo[phase].color + "22", color: phaseInfo[phase].color, borderColor: phaseInfo[phase].color + "44" }}>
          {phaseIdx + 1}/{phaseList.length} · {phaseInfo[phase].label}
        </Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setPhaseIdx((i) => (i - 1 + phaseList.length) % phaseList.length)}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setAutoplay((a) => !a)}>
            {autoplay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setPhaseIdx((i) => (i + 1) % phaseList.length)}>
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8 hidden sm:inline-flex" onClick={() => { setPhaseIdx(0); setAutoplay(false); }}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 8, 20]} />
          <Scene phase={phase} />
        </Canvas>

        {/* Phase timeline (responsive: bottom on desktop, scrollable on mobile) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-auto max-w-md sm:max-w-none">
          <div className="flex gap-1 sm:gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 sm:p-2 overflow-x-auto justify-center">
            {phaseList.map((p, i) => (
              <button
                key={p}
                onClick={() => { setPhaseIdx(i); setAutoplay(false); }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  phase === p ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={phase === p ? { backgroundColor: phaseInfo[p].color } : {}}
              >
                {phaseInfo[p].label}
              </button>
            ))}
          </div>
          {autoplay && (
            <div className="mt-2 px-3 py-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground shrink-0">Speed</span>
              <Slider value={[speed]} min={1} max={5} step={0.5} onValueChange={(v) => setSpeed(v[0])} />
              <span className="text-[10px] font-mono shrink-0">{speed}s</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 max-w-[calc(100%-1.5rem)] sm:max-w-xs bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4" style={{ color: phaseInfo[phase].color }} />
            <span className="text-xs font-bold">{phaseInfo[phase].label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{phaseInfo[phase].description}</p>
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-2 pt-2 border-t border-border/30">{phaseInfo[phase].details}</p>
        </div>

        <AIExplainPanel context={`Mitosis phase: ${phaseInfo[phase].label}. ${phaseInfo[phase].details}`} subject="Cell Division" />
      </div>
    </div>
  );
};

export default CellDivision3D;
