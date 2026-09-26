// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Stars, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Info, Layers, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

const layerData = [
  { name: "Crust", radius: 2.0, color: "#1e7a3e", thickness: "5–70 km", temp: "~500°C surface", info: "Outermost layer where life exists. Continental crust (~35 km) is granite-rich; oceanic crust (~7 km) is basaltic." },
  { name: "Upper Mantle", radius: 1.75, color: "#CD853F", thickness: "~660 km", temp: "500–900°C", info: "Contains the asthenosphere — partially molten rock that lets plates float and move." },
  { name: "Lower Mantle", radius: 1.45, color: "#D2691E", thickness: "~2,240 km", temp: "900–3,700°C", info: "Solid silicate rock under enormous pressure. Convection currents here drive plate tectonics." },
  { name: "Outer Core", radius: 1.1, color: "#FF6B35", thickness: "~2,200 km", temp: "4,400–6,100°C", info: "Liquid iron-nickel. Convection generates Earth's magnetic field through the geodynamo effect." },
  { name: "Inner Core", radius: 0.6, color: "#FFD700", thickness: "~1,220 km radius", temp: "~5,400°C", info: "Solid iron-nickel sphere. Despite extreme heat, immense pressure keeps it solid. Hotter than the Sun's surface." },
];

const plateData = [
  { name: "Pacific", position: [-1.5, 0.3, 1.2] as [number, number, number], color: "#3B82F6" },
  { name: "N. American", position: [0.8, 1.0, 0.8] as [number, number, number], color: "#10B981" },
  { name: "Eurasian", position: [0.5, 1.2, -0.8] as [number, number, number], color: "#F59E0B" },
  { name: "African", position: [-0.3, -0.2, -1.0] as [number, number, number], color: "#EF4444" },
  { name: "Antarctic", position: [0, -1.8, 0] as [number, number, number], color: "#E2E8F0" },
  { name: "S. American", position: [1.2, -0.5, 1.0] as [number, number, number], color: "#A855F7" },
  { name: "Australian", position: [-1.3, -1.0, -0.5] as [number, number, number], color: "#EC4899" },
];

function ContinentPatches() {
  // Procedurally placed continent-shaped patches on the surface (radius ~2.0)
  const patches = useMemo(() => {
    const blobs: { pos: [number, number, number]; scale: number; color: string }[] = [];
    const continents = [
      { lat: 50, lon: -100, count: 18, scale: 0.32, color: "#1f7a3a" }, // N. America
      { lat: -15, lon: -60, count: 14, scale: 0.28, color: "#2b8f44" }, // S. America
      { lat: 20, lon: 20, count: 18, scale: 0.30, color: "#3a8c3a" }, // Africa
      { lat: 50, lon: 40, count: 22, scale: 0.34, color: "#1f7a3a" }, // Eurasia
      { lat: -25, lon: 135, count: 8, scale: 0.26, color: "#5c8c2e" }, // Australia
      { lat: -85, lon: 0, count: 10, scale: 0.28, color: "#e8eef5" }, // Antarctica
      { lat: 75, lon: -40, count: 6, scale: 0.22, color: "#e8eef5" }, // Greenland
    ];
    continents.forEach((c) => {
      for (let i = 0; i < c.count; i++) {
        const dLat = (Math.random() - 0.5) * 30;
        const dLon = (Math.random() - 0.5) * 40;
        const lat = ((c.lat + dLat) * Math.PI) / 180;
        const lon = ((c.lon + dLon) * Math.PI) / 180;
        const r = 2.02;
        const x = r * Math.cos(lat) * Math.cos(lon);
        const y = r * Math.sin(lat);
        const z = r * Math.cos(lat) * Math.sin(lon);
        blobs.push({ pos: [x, y, z], scale: c.scale * (0.6 + Math.random() * 0.6), color: c.color });
      }
    });
    return blobs;
  }, []);

  return (
    <>
      {patches.map((b, i) => (
        <mesh key={i} position={b.pos}>
          <sphereGeometry args={[b.scale, 16, 16]} />
          <meshStandardMaterial color={b.color} roughness={0.85} />
        </mesh>
      ))}
    </>
  );
}

function EarthLayers({ cutaway, selectedLayer, onSelectLayer, rotationSpeed }: { cutaway: boolean; selectedLayer: string | null; onSelectLayer: (n: string | null) => void; rotationSpeed: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * rotationSpeed; });

  return (
    <group ref={groupRef}>
      {/* Realistic ocean surface (only in globe mode) */}
      {!cutaway && (
        <>
          <mesh>
            <sphereGeometry args={[2.0, 96, 96]} />
            <meshPhysicalMaterial
              color="#1e40af"
              roughness={0.35}
              metalness={0.15}
              clearcoat={0.9}
              clearcoatRoughness={0.2}
            />
          </mesh>
          <ContinentPatches />
          {/* Cloud layer */}
          <mesh>
            <sphereGeometry args={[2.08, 64, 64]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </>
      )}

      {/* Cutaway layered structure */}
      {cutaway && layerData.map((layer, i) => {
        const isSelected = selectedLayer === layer.name;
        return (
          <group key={layer.name}>
            <mesh onClick={(e) => { e.stopPropagation(); onSelectLayer(isSelected ? null : layer.name); }}>
              <sphereGeometry args={[layer.radius, 64, 64, 0, Math.PI * 1.5]} />
              <meshPhysicalMaterial
                color={layer.color}
                transparent
                opacity={isSelected ? 0.95 : selectedLayer ? 0.25 : 0.92}
                side={THREE.DoubleSide}
                roughness={i >= 3 ? 0.3 : 0.7}
                metalness={i >= 3 ? 0.6 : 0.05}
                clearcoat={i === 0 ? 0.5 : i >= 3 ? 0.7 : 0.2}
                emissive={i >= 3 ? layer.color : "#000"}
                emissiveIntensity={i >= 3 ? (isSelected ? 0.5 : 0.2) : 0}
                flatShading={i === 0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Atmosphere glow */}
      {!cutaway && (
        <mesh>
          <sphereGeometry args={[2.2, 64, 64]} />
          <meshPhysicalMaterial color="#60a5fa" transparent opacity={0.14} side={THREE.BackSide} emissive="#60a5fa" emissiveIntensity={0.4} />
        </mesh>
      )}

      {/* Tectonic plate markers (cutaway only — they were misaligned on globe) */}
      {cutaway && plateData.map((plate) => (
        <mesh key={plate.name} position={plate.position}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshPhysicalMaterial color={plate.color} emissive={plate.color} emissiveIntensity={0.5} roughness={0.3} clearcoat={1} />
          <Html distanceFactor={9} position={[0, 0.18, 0]} center style={{ pointerEvents: "none" }}>
            <span className="text-[8px] font-semibold whitespace-nowrap px-1 py-0.5 rounded bg-card/80 backdrop-blur text-foreground/80">
              {plate.name}
            </span>
          </Html>
        </mesh>
      ))}
    </group>
  );
}

function Moon() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * 0.15;
      ref.current.position.x = Math.cos(t) * 5;
      ref.current.position.z = Math.sin(t) * 5;
    }
  });
  return (
    <mesh ref={ref} position={[5, 0, 0]}>
      <sphereGeometry args={[0.27, 32, 32]} />
      <meshPhysicalMaterial color="#cbd5e1" roughness={0.95} flatShading />
    </mesh>
  );
}

const Earth3D = () => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [cutaway, setCutaway] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.1);

  const selected = layerData.find(l => l.name === selectedLayer);

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Compass className="h-4 w-4 text-green-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Earth Explorer</h1>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={() => setCutaway(!cutaway)}>
            <Layers className="h-3 w-3 mr-1" /> {cutaway ? "Globe" : "Cutaway"}
          </Button>
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8" onClick={() => setSelectedLayer(null)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1, 6], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#020617"]} />
          <fog attach="fog" args={["#020617", 12, 30]} />
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.4} color="#60a5fa" />
          <pointLight position={[0, 0, 0]} intensity={1.5} color="#FFD700" />
          <hemisphereLight args={["#87CEEB", "#8B4513", 0.2]} />
          <Stars radius={200} depth={80} count={4000} factor={4} fade speed={0.3} />
          <Sparkles count={40} scale={[10, 10, 10]} size={2} speed={0.2} />
          <EarthLayers cutaway={cutaway} selectedLayer={selectedLayer} onSelectLayer={setSelectedLayer} rotationSpeed={rotationSpeed} />
          {!cutaway && <Moon />}
          <OrbitControls enablePan minDistance={3} maxDistance={14} />
        </Canvas>

        {/* Rotation speed */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 w-52">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="h-3.5 w-3.5 text-green-500" />
            <span className="text-[11px] font-semibold">Rotation</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{rotationSpeed.toFixed(2)}</span>
          </div>
          <Slider value={[rotationSpeed]} min={0} max={1} step={0.05} onValueChange={(v) => setRotationSpeed(v[0])} />
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-64 max-w-[calc(100%-1.5rem)] glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Earth Layers</h3>
          </div>
          <div className="space-y-1.5">
            {layerData.map((layer) => (
              <button
                key={layer.name}
                onClick={() => setSelectedLayer(selectedLayer === layer.name ? null : layer.name)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
                  selectedLayer === layer.name ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                {layer.name}
              </button>
            ))}
          </div>
          {selected && (
            <div className="pt-2 border-t border-border/50 space-y-1">
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div><span className="text-muted-foreground">Thickness:</span> {selected.thickness}</div>
                <div><span className="text-muted-foreground">Temp:</span> {selected.temp}</div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{selected.info}</p>
            </div>
          )}
        </motion.div>
      </div>
      <AIExplainPanel
        context={`${cutaway ? "Cross-section" : "Globe view"}. ${selectedLayer ? `Selected: ${selectedLayer} — ${selected?.info}` : "No layer selected."}`}
        subject="Earth's Structure"
      />
    </div>
  );
};

export default Earth3D;
