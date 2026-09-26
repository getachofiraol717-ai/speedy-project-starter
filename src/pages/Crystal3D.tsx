// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Info, Pause, Play, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

interface CrystalType {
  name: string;
  shortName: string;
  info: string;
  hardness: string;
  meltingPoint: string;
  atoms: { pos: [number, number, number]; color: string; radius: number; label: string }[];
  bonds: [number, number][];
}

// Generate a 2x2x2 NaCl-like cube
const naclAtoms: CrystalType["atoms"] = [];
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      const isNa = (x + y + z) % 2 === 0;
      naclAtoms.push({
        pos: [x * 1.2, y * 1.2, z * 1.2],
        color: isNa ? "#a855f7" : "#10b981",
        radius: isNa ? 0.3 : 0.42,
        label: isNa ? "Na⁺" : "Cl⁻",
      });
    }
  }
}
const naclBonds: [number, number][] = [];
for (let i = 0; i < naclAtoms.length; i++) {
  for (let j = i + 1; j < naclAtoms.length; j++) {
    const d = Math.hypot(naclAtoms[i].pos[0] - naclAtoms[j].pos[0], naclAtoms[i].pos[1] - naclAtoms[j].pos[1], naclAtoms[i].pos[2] - naclAtoms[j].pos[2]);
    if (Math.abs(d - 1.2) < 0.05) naclBonds.push([i, j]);
  }
}

const crystals: CrystalType[] = [
  {
    name: "NaCl (Halite/Salt)", shortName: "NaCl",
    hardness: "2.5 Mohs", meltingPoint: "801°C",
    info: "Sodium chloride forms a face-centered cubic lattice. Na⁺ and Cl⁻ ions alternate in a 3D checkerboard pattern. Ionic bonds give it a high melting point and brittle crystalline structure.",
    atoms: naclAtoms,
    bonds: naclBonds,
  },
  {
    name: "Diamond (Carbon)", shortName: "Diamond",
    hardness: "10 Mohs (hardest)", meltingPoint: "3550°C",
    info: "Each carbon atom forms 4 covalent bonds in a tetrahedral arrangement. This 3D network of strong sp³ bonds gives diamond extreme hardness and high refractive index (2.42).",
    atoms: [
      { pos: [0, 0, 0], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [1, 1, 0], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [1, 0, 1], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [0, 1, 1], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [0.5, 0.5, 0.5], color: "#cbd5e1", radius: 0.3, label: "C" },
      { pos: [2, 0, 0], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [0, 2, 0], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [0, 0, 2], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [2, 1, 1], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [1, 2, 1], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [1, 1, 2], color: "#f1f5f9", radius: 0.3, label: "C" },
      { pos: [1.5, 0.5, 0.5], color: "#cbd5e1", radius: 0.3, label: "C" },
      { pos: [0.5, 1.5, 0.5], color: "#cbd5e1", radius: 0.3, label: "C" },
      { pos: [0.5, 0.5, 1.5], color: "#cbd5e1", radius: 0.3, label: "C" },
    ],
    bonds: [[0,4],[1,4],[2,4],[3,4],[5,11],[6,12],[7,13],[8,11],[9,12],[10,13],[1,11],[1,12],[2,11],[2,13],[3,12],[3,13]],
  },
  {
    name: "Ice (Hexagonal H₂O)", shortName: "Ice",
    hardness: "1.5 Mohs", meltingPoint: "0°C",
    info: "Ice forms a hexagonal lattice held by hydrogen bonds. The open structure makes ice less dense than liquid water (0.92 g/cm³) — that's why ice floats!",
    atoms: [
      { pos: [0, 0, 0], color: "#EF4444", radius: 0.4, label: "O" },
      { pos: [0.7, 0.4, 0], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [-0.7, 0.4, 0], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [1.5, 1.2, 0.6], color: "#EF4444", radius: 0.4, label: "O" },
      { pos: [2.2, 1.5, 0.6], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [0.9, 1.5, 0.6], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [0, 2.4, 1.2], color: "#EF4444", radius: 0.4, label: "O" },
      { pos: [0.7, 2.7, 1.2], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [-0.7, 2.7, 1.2], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [-1.5, 1.2, 0.6], color: "#EF4444", radius: 0.4, label: "O" },
      { pos: [-2.2, 1.5, 0.6], color: "#E2E8F0", radius: 0.2, label: "H" },
      { pos: [-0.9, 1.5, 0.6], color: "#E2E8F0", radius: 0.2, label: "H" },
    ],
    bonds: [[0,1],[0,2],[3,4],[3,5],[6,7],[6,8],[9,10],[9,11],[1,5],[4,7],[10,2],[8,11]],
  },
  {
    name: "Quartz (SiO₂)", shortName: "Quartz",
    hardness: "7 Mohs", meltingPoint: "1713°C",
    info: "Quartz has Si atoms tetrahedrally bonded to 4 O atoms in a continuous 3D network. Piezoelectric — generates voltage when compressed. Used in watches and electronics.",
    atoms: [
      { pos: [0, 0, 0], color: "#fbbf24", radius: 0.35, label: "Si" },
      { pos: [1, 1, 0], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [-1, 1, 0], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [0, -1, 1], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [0, -1, -1], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [2, 2, 0], color: "#fbbf24", radius: 0.35, label: "Si" },
      { pos: [-2, 2, 0], color: "#fbbf24", radius: 0.35, label: "Si" },
      { pos: [3, 1, 0], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [-3, 1, 0], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [2, 3, 0], color: "#ef4444", radius: 0.3, label: "O" },
      { pos: [-2, 3, 0], color: "#ef4444", radius: 0.3, label: "O" },
    ],
    bonds: [[0,1],[0,2],[0,3],[0,4],[1,5],[2,6],[5,7],[5,9],[6,8],[6,10]],
  },
];

function Bond({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mid = new THREE.Vector3(...from).add(new THREE.Vector3(...to)).multiplyScalar(0.5);
  const dir = new THREE.Vector3(...to).sub(new THREE.Vector3(...from));
  const len = dir.length();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.04, 0.04, len, 12]} />
      <meshPhysicalMaterial color="#475569" transparent opacity={0.55} roughness={0.2} metalness={0.5} />
    </mesh>
  );
}

function CrystalView({ crystal, selectedAtom, onSelectAtom, paused, scale }: { crystal: CrystalType; selectedAtom: number | null; onSelectAtom: (i: number | null) => void; paused: boolean; scale: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (groupRef.current && !paused) groupRef.current.rotation.y += delta * 0.15; });

  const center = crystal.atoms.reduce((acc, a) => [acc[0] + a.pos[0], acc[1] + a.pos[1], acc[2] + a.pos[2]], [0, 0, 0]).map(v => v / crystal.atoms.length) as [number, number, number];

  return (
    <group ref={groupRef} position={[-center[0], -center[1], -center[2]]} scale={scale}>
      {crystal.bonds.map(([a, b], i) => (
        <Bond key={i} from={crystal.atoms[a].pos} to={crystal.atoms[b].pos} />
      ))}
      {crystal.atoms.map((atom, i) => (
        <group key={i}>
          <mesh
            position={atom.pos}
            onClick={(e) => { e.stopPropagation(); onSelectAtom(selectedAtom === i ? null : i); }}
          >
            <sphereGeometry args={[atom.radius, 48, 48]} />
            <meshPhysicalMaterial
              color={atom.color}
              emissive={selectedAtom === i ? atom.color : "#000"}
              emissiveIntensity={selectedAtom === i ? 0.6 : 0.05}
              metalness={0.3}
              roughness={0.15}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>
          {selectedAtom === i && (
            <Html distanceFactor={8} position={[atom.pos[0], atom.pos[1] + atom.radius + 0.3, atom.pos[2]]} center style={{ pointerEvents: "none" }}>
              <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-card/90 backdrop-blur">{atom.label}</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

const Crystal3D = () => {
  const [activeCrystal, setActiveCrystal] = useState(0);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [scale, setScale] = useState(1);
  const c = crystals[activeCrystal];

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Gem className="h-4 w-4 text-amber-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Crystal Lab</h1>
        <div className="ml-auto flex items-center gap-1 overflow-x-auto">
          {crystals.map((cr, i) => (
            <button
              key={cr.name}
              onClick={() => { setActiveCrystal(i); setSelectedAtom(null); }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeCrystal === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cr.shortName}
            </button>
          ))}
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8 ml-1 shrink-0" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1, 7], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 10, 22]} />
          <ambientLight intensity={0.18} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#818cf8" />
          <spotLight position={[0, 8, 0]} angle={0.3} penumbra={1} intensity={2.5} color="#e2e8f0" />
          <Sparkles count={30} scale={[8, 8, 8]} size={1.5} speed={0.3} color="#fbbf24" />
          <CrystalView crystal={c} selectedAtom={selectedAtom} onSelectAtom={setSelectedAtom} paused={paused} scale={scale} />
          <mesh position={[0, -3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshPhysicalMaterial color="#0f172a" roughness={0.05} metalness={0.9} />
          </mesh>
          <OrbitControls enablePan enableZoom minDistance={2} maxDistance={16} />
          <Environment preset="warehouse" />
        </Canvas>

        {/* Scale slider */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 w-48">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold">Zoom</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground">{scale.toFixed(1)}x</span>
          </div>
          <Slider value={[scale]} min={0.4} max={2} step={0.1} onValueChange={(v) => setScale(v[0])} />
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-72 max-w-[calc(100%-1.5rem)] glass-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{c.name}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-secondary/50 rounded p-2">
              <div className="text-muted-foreground">Hardness</div>
              <div className="font-semibold">{c.hardness}</div>
            </div>
            <div className="bg-secondary/50 rounded p-2">
              <div className="text-muted-foreground">Melting</div>
              <div className="font-semibold">{c.meltingPoint}</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{c.info}</p>
        </motion.div>
      </div>
      <AIExplainPanel
        context={`Crystal: ${c.name}. Hardness ${c.hardness}, melting ${c.meltingPoint}. ${c.info}`}
        subject="Crystal Structures"
      />
    </div>
  );
};

export default Crystal3D;
