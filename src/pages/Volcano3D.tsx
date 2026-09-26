// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sparkles } from "@react-three/drei";
import { ArrowLeft, Mountain, Flame, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import AIExplainPanel from "@/components/3d/AIExplainPanel";
import * as THREE from "three";

type Layer = "exterior" | "magma-chamber" | "conduit" | "crater" | "lava-flow";

const layerInfo: Record<Layer, { label: string; description: string; color: string }> = {
  exterior: { label: "Exterior", description: "The cone-shaped structure built from layers of lava, ash, and tephra accumulated over many eruptions.", color: "#78716c" },
  "magma-chamber": { label: "Magma Chamber", description: "Underground reservoir of molten rock 1-10 km below the surface. Pressure here drives every eruption.", color: "#ef4444" },
  conduit: { label: "Conduit", description: "The vertical pipe transporting magma from chamber to crater — narrow enough that gases expand explosively as pressure drops.", color: "#f97316" },
  crater: { label: "Crater", description: "Bowl-shaped summit depression where magma exits. Often contains a vent and may collapse into a caldera.", color: "#a16207" },
  "lava-flow": { label: "Lava Flow", description: "Molten rock flowing down slopes at 600-1200°C. Basaltic lava is fluid; rhyolitic lava is thick and explosive.", color: "#dc2626" },
};

function VolcanoScene({ activeLayer, eruption, paused }: { activeLayer: Layer; eruption: number; paused: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const showCutaway = activeLayer !== "exterior";

  useFrame((_, delta) => {
    if (ref.current && !paused) ref.current.rotation.y += delta * 0.08;
  });

  // Procedural rocky terrain points around base
  const rocks = useMemo(() => Array.from({ length: 20 }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    return { pos: [Math.cos(angle) * radius, -1.95, Math.sin(angle) * radius] as [number, number, number], scale: 0.15 + Math.random() * 0.25 };
  }), []);

  const eruptionLevel = eruption / 100;

  return (
    <group ref={ref}>
      {/* Main cone — layered for realistic stratovolcano look */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <coneGeometry args={[3, 4, 64, 16, !showCutaway, 0, showCutaway ? Math.PI * 1.55 : Math.PI * 2]} />
        <meshPhysicalMaterial color="#3f3a35" roughness={0.95} metalness={0.05} flatShading />
      </mesh>
      <mesh position={[0, -0.5, 0]} castShadow>
        <coneGeometry args={[2.7, 3.6, 64, 12, true, 0, showCutaway ? Math.PI * 1.55 : Math.PI * 2]} />
        <meshPhysicalMaterial color="#57534e" roughness={0.85} metalness={0.05} flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <coneGeometry args={[1.6, 2, 64, 8, true, 0, showCutaway ? Math.PI * 1.55 : Math.PI * 2]} />
        <meshPhysicalMaterial color="#6b6660" roughness={0.8} flatShading />
      </mesh>

      {/* Snow cap */}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.85, 0.9, 64, 4, false, 0, showCutaway ? Math.PI * 1.55 : Math.PI * 2]} />
        <meshPhysicalMaterial color="#f8fafc" roughness={0.4} clearcoat={0.9} clearcoatRoughness={0.2} />
      </mesh>

      {/* Crater rim */}
      <mesh position={[0, 1.85, 0]}>
        <torusGeometry args={[0.42, 0.14, 16, 48]} />
        <meshPhysicalMaterial
          color={activeLayer === "crater" ? "#7f1d1d" : "#292524"}
          emissive={activeLayer === "crater" || eruptionLevel > 0.3 ? "#ef4444" : "#000"}
          emissiveIntensity={activeLayer === "crater" ? 0.7 : eruptionLevel * 0.6}
          roughness={0.7}
        />
      </mesh>

      {/* Glowing crater pool */}
      <mesh position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.05, 32]} />
        <meshPhysicalMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={1.2 + eruptionLevel} />
      </mesh>

      {/* Magma chamber */}
      {showCutaway && (
        <>
          <mesh position={[0, -2, 0]}>
            <sphereGeometry args={[1.3, 48, 48, 0, Math.PI * 1.55]} />
            <meshPhysicalMaterial
              color="#dc2626"
              emissive="#ef4444"
              emissiveIntensity={activeLayer === "magma-chamber" ? 1.1 : 0.45}
              roughness={0.2}
              transparent opacity={0.92}
              clearcoat={0.5}
            />
          </mesh>
          <Sparkles count={30} scale={[2, 1.5, 2]} position={[0, -2, 0]} size={3} speed={0.4} color="#fbbf24" />
        </>
      )}

      {/* Conduit */}
      {showCutaway && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.3, 4, 24, 1, true, 0, Math.PI * 1.55]} />
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#fb923c"
            emissiveIntensity={activeLayer === "conduit" ? 1 : 0.4}
            transparent opacity={0.88}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Lava flows down slopes */}
      {(activeLayer === "lava-flow" || activeLayer === "exterior" || eruptionLevel > 0.2) && (
        <>
          {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
            <mesh key={i} position={[Math.sin(angle) * 1.8, -0.8 - i * 0.05, Math.cos(angle) * 1.8]} rotation={[0.7, angle, 0]}>
              <capsuleGeometry args={[0.1, 1.8, 4, 12]} />
              <meshPhysicalMaterial
                color="#dc2626"
                emissive="#fb923c"
                emissiveIntensity={activeLayer === "lava-flow" ? 1.4 : 0.4 + eruptionLevel}
                roughness={0.3}
                transparent opacity={0.85}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Eruption plume */}
      {eruptionLevel > 0.1 && (
        <>
          {[...Array(Math.floor(eruptionLevel * 25))].map((_, i) => (
            <Float key={i} speed={1 + i * 0.2} floatIntensity={0.8} floatingRange={[0, 2]}>
              <mesh position={[(Math.random() - 0.5) * 1, 2.5 + Math.random() * 3 * eruptionLevel, (Math.random() - 0.5) * 1]}>
                <sphereGeometry args={[0.2 + Math.random() * 0.3, 12, 12]} />
                <meshStandardMaterial color={i % 3 === 0 ? "#fb923c" : "#78716c"} transparent opacity={0.4 - i * 0.012} emissive={i % 3 === 0 ? "#fb923c" : "#000"} emissiveIntensity={0.4} />
              </mesh>
            </Float>
          ))}
          <Sparkles count={Math.floor(eruptionLevel * 80)} scale={[2, 5, 2]} position={[0, 4, 0]} size={4} speed={2} color="#f97316" />
        </>
      )}

      {/* Ambient smoke */}
      {[...Array(8)].map((_, i) => (
        <Float key={`smoke-${i}`} speed={1 + i * 0.3} floatIntensity={0.5} floatingRange={[0, 1]}>
          <mesh position={[(Math.random() - 0.5) * 0.6, 2.3 + i * 0.4, (Math.random() - 0.5) * 0.6]}>
            <sphereGeometry args={[0.15 + Math.random() * 0.15, 12, 12]} />
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.15 - i * 0.012} />
          </mesh>
        </Float>
      ))}

      {/* Ground rocks */}
      {rocks.map((r, i) => (
        <mesh key={`r-${i}`} position={r.pos}>
          <dodecahedronGeometry args={[r.scale, 0]} />
          <meshPhysicalMaterial color="#1c1917" roughness={0.95} flatShading />
        </mesh>
      ))}
    </group>
  );
}

const Volcano3D = () => {
  const [activeLayer, setActiveLayer] = useState<Layer>("exterior");
  const [eruption, setEruption] = useState(20);
  const [paused, setPaused] = useState(false);
  const layers: Layer[] = ["exterior", "magma-chamber", "conduit", "crater", "lava-flow"];

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Mountain className="h-4 w-4 text-orange-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Volcano Lab</h1>
        <Badge className="text-[10px] hidden sm:inline-flex" variant="secondary">{layerInfo[activeLayer].label}</Badge>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => setEruption((e) => e > 50 ? 20 : 90)}>
            <Flame className="h-3 w-3 mr-1" /> {eruption > 50 ? "Calm" : "Erupt!"}
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [4, 2, 7], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#1a0f08"]} />
          <fog attach="fog" args={["#1a0f08", 12, 30]} />
          <ambientLight intensity={0.18} />
          <hemisphereLight args={["#fed7aa", "#1c0a05", 0.4]} />
          <spotLight position={[5, 8, 5]} angle={0.3} penumbra={0.8} intensity={3.2} castShadow shadow-mapSize={2048} color="#fef3c7" />
          <pointLight position={[0, -1.5, 0]} intensity={3.5 + (eruption / 30)} color="#ef4444" distance={8} />
          <pointLight position={[0, 2, 0]} intensity={0.8 + eruption / 100} color="#fb923c" distance={5} />
          <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[40, 40]} />
            <meshPhysicalMaterial color="#0a0a08" roughness={0.92} metalness={0.05} />
          </mesh>
          <VolcanoScene activeLayer={activeLayer} eruption={eruption} paused={paused} />
          <OrbitControls enablePan={false} minDistance={5} maxDistance={14} autoRotate={!paused} autoRotateSpeed={0.3} />
          <Environment preset="sunset" />
        </Canvas>

        {/* Eruption intensity slider */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 w-56">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-[11px] font-semibold">Eruption Intensity</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{eruption}%</span>
          </div>
          <Slider value={[eruption]} min={0} max={100} step={5} onValueChange={(v) => setEruption(v[0])} />
        </div>

        {/* Layer selector */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] sm:w-auto max-w-md">
          <div className="flex gap-1 sm:gap-2 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 sm:p-2 overflow-x-auto justify-center">
            {layers.map((l) => (
              <button
                key={l}
                onClick={() => setActiveLayer(l)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap shrink-0 ${activeLayer === l ? "text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                style={activeLayer === l ? { backgroundColor: layerInfo[l].color } : {}}
              >
                {layerInfo[l].label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-[calc(100%-1.5rem)] sm:max-w-xs bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: layerInfo[activeLayer].color }} />
            <span className="text-xs font-bold">{layerInfo[activeLayer].label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{layerInfo[activeLayer].description}</p>
        </div>

        <AIExplainPanel context={`Volcano Lab. Layer: ${layerInfo[activeLayer].label}. Eruption ${eruption}%. ${layerInfo[activeLayer].description}`} subject="Volcano" />
      </div>
    </div>
  );
};

export default Volcano3D;
