// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles, Sky } from "@react-three/drei";
import { ArrowLeft, Droplets, Sun, CloudRain } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import AIExplainPanel from "@/components/3d/AIExplainPanel";
import * as THREE from "three";

type Stage = "evaporation" | "condensation" | "precipitation" | "collection" | "all";

const stageInfo: Record<Stage, { label: string; description: string; color: string }> = {
  all: { label: "Full Cycle", description: "Water moves through evaporation, condensation, precipitation, and collection in a continuous loop.", color: "#3b82f6" },
  evaporation: { label: "Evaporation", description: "Solar energy turns surface water into vapor — about 90% from oceans. Plants also release vapor via transpiration.", color: "#f97316" },
  condensation: { label: "Condensation", description: "Vapor cools as it rises, condensing on dust and ice nuclei to form cloud droplets and ice crystals.", color: "#94a3b8" },
  precipitation: { label: "Precipitation", description: "When droplets coalesce and become too heavy, they fall as rain, snow, sleet, or hail.", color: "#60a5fa" },
  collection: { label: "Collection", description: "Water gathers in oceans, lakes, glaciers, and aquifers — runoff returns to the sea, restarting the cycle.", color: "#06b6d4" },
};

function Ocean({ highlight, time }: { highlight: boolean; time: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useRef(new THREE.PlaneGeometry(16, 16, 60, 60));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geo.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.7 + t * 0.8) * 0.08 + Math.sin(y * 0.5 + t * 0.6) * 0.06);
    }
    pos.needsUpdate = true;
    geo.current.computeVertexNormals();
  });

  return (
    <mesh ref={ref} geometry={geo.current} position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <meshPhysicalMaterial
        color={highlight ? "#0ea5e9" : "#075985"}
        roughness={0.15}
        metalness={0.4}
        clearcoat={1}
        transparent opacity={0.92}
        emissive="#0ea5e9"
        emissiveIntensity={highlight ? 0.18 : 0.04}
      />
    </mesh>
  );
}

function EvaporationParticles({ visible, intensity }: { visible: boolean; intensity: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current || !visible) return;
    ref.current.children.forEach((child) => {
      child.position.y += 0.015 * intensity;
      if (child.position.y > 3.5) child.position.y = -1.4;
    });
  });
  if (!visible) return null;
  return (
    <group ref={ref}>
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 8, -1.4 + Math.random() * 4, (Math.random() - 0.5) * 8]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fcd34d" emissive="#f97316" emissiveIntensity={0.7} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds3D({ highlight, density }: { highlight: boolean; density: number }) {
  const clouds = useMemo(() => Array.from({ length: density }, (_, i) => ({
    pos: [(i - density / 2) * 1.5 + (Math.random() - 0.5), 3 + Math.random() * 0.5, (Math.random() - 0.5) * 4] as [number, number, number],
    scale: 0.7 + Math.random() * 0.5,
  })), [density]);

  return (
    <group>
      {clouds.map((c, i) => (
        <Float key={i} speed={0.4} floatIntensity={0.3}>
          <group position={c.pos} scale={c.scale}>
            <mesh><sphereGeometry args={[0.7, 16, 16]} /><meshStandardMaterial color="#f8fafc" transparent opacity={highlight ? 0.95 : 0.6} /></mesh>
            <mesh position={[0.5, 0.1, 0]}><sphereGeometry args={[0.55, 16, 16]} /><meshStandardMaterial color="#f1f5f9" transparent opacity={highlight ? 0.95 : 0.55} /></mesh>
            <mesh position={[-0.45, -0.1, 0.2]}><sphereGeometry args={[0.6, 16, 16]} /><meshStandardMaterial color="#e2e8f0" transparent opacity={highlight ? 0.92 : 0.5} /></mesh>
            <mesh position={[0.2, 0.3, -0.3]}><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color="#ffffff" transparent opacity={highlight ? 0.95 : 0.55} /></mesh>
          </group>
        </Float>
      ))}
    </group>
  );
}

function RainDrops({ visible, intensity }: { visible: boolean; intensity: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current || !visible) return;
    ref.current.children.forEach((child) => {
      child.position.y -= 0.07 * intensity;
      if (child.position.y < -1.4) child.position.y = 3 + Math.random() * 0.5;
    });
  });
  if (!visible) return null;
  return (
    <group ref={ref}>
      {Array.from({ length: 80 }, (_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 8, Math.random() * 4 - 1, (Math.random() - 0.5) * 8]}>
          <capsuleGeometry args={[0.018, 0.12, 4, 6]} />
          <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.4} transparent opacity={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Terrain() {
  return (
    <group>
      {/* Mountain range */}
      <mesh position={[5, -0.2, -2.5]} castShadow>
        <coneGeometry args={[2, 3.5, 8]} />
        <meshPhysicalMaterial color="#3f3a35" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[5, 1.4, -2.5]}>
        <coneGeometry args={[0.7, 1, 8]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.5} clearcoat={0.8} />
      </mesh>
      <mesh position={[3.5, -0.6, -3]} castShadow>
        <coneGeometry args={[1.4, 2.5, 6]} />
        <meshPhysicalMaterial color="#52453a" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[3.5, 0.6, -3]}>
        <coneGeometry args={[0.45, 0.7, 6]} />
        <meshPhysicalMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>

      {/* Forest area */}
      <mesh position={[-4, -1.2, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 4]} />
        <meshPhysicalMaterial color="#365314" roughness={0.95} />
      </mesh>
      {/* Trees */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[-5 + Math.random() * 4, -1, -1 + Math.random() * 3]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
            <meshPhysicalMaterial color="#78350f" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.3, 0.6, 8]} />
            <meshPhysicalMaterial color="#166534" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* River from mountains to ocean */}
      <mesh position={[2, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 0.5]} />
        <meshPhysicalMaterial color="#0ea5e9" roughness={0.1} metalness={0.5} clearcoat={1} emissive="#0ea5e9" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

function Sun3D({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <group position={[6, 5, -3]}>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.4} />
      </mesh>
      <Sparkles count={20} scale={[2, 2, 2]} size={4} speed={0.3} color="#fef08a" />
    </group>
  );
}

function Scene({ stage, intensity }: { stage: Stage; intensity: number }) {
  const showSun = stage === "evaporation" || stage === "all";
  const showRain = stage === "precipitation" || stage === "all";
  const showEvap = stage === "evaporation" || stage === "all";
  const cloudDensity = stage === "condensation" ? 6 : stage === "precipitation" ? 5 : 3;

  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={["#bfdbfe", "#1e3a5f", 0.5]} />
      <directionalLight position={[6, 8, -3]} intensity={2.2} color={showSun ? "#fef3c7" : "#cbd5e1"} castShadow shadow-mapSize={2048} />
      <Sky distance={450000} sunPosition={[6, 5, -3]} inclination={0.4} azimuth={0.25} />
      <Sun3D visible={showSun} />
      <Ocean highlight={stage === "collection" || stage === "evaporation" || stage === "all"} time={0} />
      <EvaporationParticles visible={showEvap} intensity={intensity / 50} />
      <Clouds3D highlight={stage === "condensation" || stage === "all"} density={cloudDensity} />
      <RainDrops visible={showRain} intensity={intensity / 50} />
      <Terrain />
      <OrbitControls enablePan={false} minDistance={6} maxDistance={16} autoRotate autoRotateSpeed={0.15} />
    </>
  );
}

const WaterCycle3D = () => {
  const [stage, setStage] = useState<Stage>("all");
  const [intensity, setIntensity] = useState(50);
  const stages: Stage[] = ["all", "evaporation", "condensation", "precipitation", "collection"];

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Droplets className="h-4 w-4 text-blue-400 shrink-0" />
        <h1 className="text-sm font-bold truncate">Water Cycle</h1>
        <Badge className="text-[10px] hidden sm:inline-flex" variant="secondary">{stageInfo[stage].label}</Badge>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 3, 11], fov: 50 }} shadows>
          <ResponsiveCamera baseFov={50} />
          <Scene stage={stage} intensity={intensity} />
        </Canvas>

        {/* Intensity slider */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 w-56">
          <div className="flex items-center gap-2 mb-2">
            {stage === "precipitation" ? <CloudRain className="h-3.5 w-3.5 text-blue-400" /> : <Sun className="h-3.5 w-3.5 text-orange-400" />}
            <span className="text-[11px] font-semibold">Intensity</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{intensity}%</span>
          </div>
          <Slider value={[intensity]} min={10} max={100} step={5} onValueChange={(v) => setIntensity(v[0])} />
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-auto max-w-md">
          <div className="flex gap-1 sm:gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 sm:p-2 overflow-x-auto justify-center">
            {stages.map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap shrink-0 ${stage === s ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                style={stage === s ? { backgroundColor: stageInfo[s].color } : {}}
              >
                {stageInfo[s].label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-[calc(100%-1.5rem)] sm:max-w-xs bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stageInfo[stage].color }} />
            <span className="text-xs font-bold">{stageInfo[stage].label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{stageInfo[stage].description}</p>
        </div>

        <AIExplainPanel context={`Water Cycle. Stage: ${stageInfo[stage].label}. Intensity: ${intensity}%. ${stageInfo[stage].description}`} subject="Water Cycle" />
      </div>
    </div>
  );
};

export default WaterCycle3D;
