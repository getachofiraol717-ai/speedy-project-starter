// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Info, ChevronLeft, ChevronRight, Pause, Play, Atom } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

type AtomDef = { element: string; position: [number, number, number]; color: string; radius: number };
type BondDef = { from: number; to: number; double?: boolean; triple?: boolean };
type MoleculeDef = { name: string; formula: string; info: string; atoms: AtomDef[]; bonds: BondDef[]; geometry: string; uses: string };

const C = "#2C3E50", O = "#E74C3C", H = "#ECF0F1", N = "#3498DB", S = "#F1C40F", Cl = "#27AE60";

const molecules: MoleculeDef[] = [
  {
    name: "Water", formula: "H₂O", geometry: "Bent (104.5°)",
    uses: "Solvent of life, hydrogen bonding, polar molecule.",
    info: "Water has a bent geometry due to oxygen's two lone pairs. The polarity creates hydrogen bonds — explaining surface tension, high boiling point, and water's role as 'universal solvent'.",
    atoms: [
      { element: "O", position: [0, 0, 0], color: O, radius: 0.5 },
      { element: "H", position: [-1.2, -0.8, 0], color: H, radius: 0.32 },
      { element: "H", position: [1.2, -0.8, 0], color: H, radius: 0.32 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
  },
  {
    name: "Carbon Dioxide", formula: "CO₂", geometry: "Linear (180°)",
    uses: "Greenhouse gas, photosynthesis input, fire suppression.",
    info: "CO₂ is linear with two C=O double bonds. Although polar bonds, the symmetry cancels dipoles — making it nonpolar overall.",
    atoms: [
      { element: "C", position: [0, 0, 0], color: C, radius: 0.45 },
      { element: "O", position: [-1.6, 0, 0], color: O, radius: 0.5 },
      { element: "O", position: [1.6, 0, 0], color: O, radius: 0.5 },
    ],
    bonds: [{ from: 0, to: 1, double: true }, { from: 0, to: 2, double: true }],
  },
  {
    name: "Methane", formula: "CH₄", geometry: "Tetrahedral (109.5°)",
    uses: "Natural gas, fuel, potent greenhouse gas.",
    info: "Methane is the simplest hydrocarbon — perfectly tetrahedral. It is ~80x more potent than CO₂ as a greenhouse gas (over 20 years).",
    atoms: [
      { element: "C", position: [0, 0, 0], color: C, radius: 0.45 },
      { element: "H", position: [1, 1, 0], color: H, radius: 0.32 },
      { element: "H", position: [-1, 1, 0], color: H, radius: 0.32 },
      { element: "H", position: [0, -0.5, 1.2], color: H, radius: 0.32 },
      { element: "H", position: [0, -0.5, -1.2], color: H, radius: 0.32 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }],
  },
  {
    name: "Ammonia", formula: "NH₃", geometry: "Trigonal pyramidal (107°)",
    uses: "Fertilizer, cleaning agent, refrigerant.",
    info: "Nitrogen has one lone pair, pushing the three N-H bonds into a pyramid. Ammonia is a weak base in water.",
    atoms: [
      { element: "N", position: [0, 0.4, 0], color: N, radius: 0.48 },
      { element: "H", position: [-1, -0.6, 0.5], color: H, radius: 0.32 },
      { element: "H", position: [1, -0.6, 0.5], color: H, radius: 0.32 },
      { element: "H", position: [0, -0.6, -1], color: H, radius: 0.32 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }],
  },
  {
    name: "Ethanol", formula: "C₂H₆O", geometry: "Tetrahedral chain",
    uses: "Alcoholic beverages, solvent, biofuel, antiseptic.",
    info: "Ethanol contains a hydroxyl (-OH) group that hydrogen-bonds with water — making it fully miscible.",
    atoms: [
      { element: "C", position: [-0.8, 0, 0], color: C, radius: 0.42 },
      { element: "C", position: [0.8, 0, 0], color: C, radius: 0.42 },
      { element: "O", position: [1.6, 1.1, 0], color: O, radius: 0.45 },
      { element: "H", position: [-1.5, 0.9, 0.3], color: H, radius: 0.28 },
      { element: "H", position: [-1.5, -0.9, -0.3], color: H, radius: 0.28 },
      { element: "H", position: [-0.8, 0, 1.1], color: H, radius: 0.28 },
      { element: "H", position: [0.8, -0.9, 0.7], color: H, radius: 0.28 },
      { element: "H", position: [0.8, -0.9, -0.7], color: H, radius: 0.28 },
      { element: "H", position: [2.4, 1.1, 0.3], color: H, radius: 0.28 },
    ],
    bonds: [
      { from: 0, to: 1 }, { from: 1, to: 2 },
      { from: 0, to: 3 }, { from: 0, to: 4 }, { from: 0, to: 5 },
      { from: 1, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
    ],
  },
  {
    name: "Glucose", formula: "C₆H₁₂O₆", geometry: "Hexagonal ring",
    uses: "Primary energy source for cells, blood sugar.",
    info: "Glucose forms a six-membered ring (pyranose). It is the body's main fuel — broken down via glycolysis to make ATP.",
    atoms: [
      { element: "C", position: [1.2, 0, 0], color: C, radius: 0.4 },
      { element: "C", position: [0.6, 1.0, 0], color: C, radius: 0.4 },
      { element: "C", position: [-0.6, 1.0, 0], color: C, radius: 0.4 },
      { element: "C", position: [-1.2, 0, 0], color: C, radius: 0.4 },
      { element: "C", position: [-0.6, -1.0, 0], color: C, radius: 0.4 },
      { element: "O", position: [0.6, -1.0, 0], color: O, radius: 0.42 },
      { element: "O", position: [2.4, 0, 0], color: O, radius: 0.4 },
      { element: "O", position: [1.2, 2.0, 0], color: O, radius: 0.4 },
      { element: "O", position: [-1.2, 2.0, 0], color: O, radius: 0.4 },
      { element: "O", position: [-2.4, 0, 0], color: O, radius: 0.4 },
      { element: "C", position: [-1.2, -2.0, 0], color: C, radius: 0.4 },
      { element: "O", position: [-2.4, -2.5, 0], color: O, radius: 0.4 },
    ],
    bonds: [
      { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
      { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
      { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 10, to: 11 },
    ],
  },
  {
    name: "Benzene", formula: "C₆H₆", geometry: "Planar hexagonal",
    uses: "Industrial solvent, precursor to plastics, drugs, dyes.",
    info: "Benzene's six carbons form a perfectly flat ring with delocalized π electrons (resonance) — extra stable.",
    atoms: Array.from({ length: 6 }, (_, i) => ({
      element: "C",
      position: [Math.cos((i / 6) * Math.PI * 2) * 1.2, Math.sin((i / 6) * Math.PI * 2) * 1.2, 0] as [number, number, number],
      color: C, radius: 0.4,
    })).concat(Array.from({ length: 6 }, (_, i) => ({
      element: "H",
      position: [Math.cos((i / 6) * Math.PI * 2) * 2.2, Math.sin((i / 6) * Math.PI * 2) * 2.2, 0] as [number, number, number],
      color: H, radius: 0.28,
    }))),
    bonds: [
      { from: 0, to: 1 }, { from: 1, to: 2, double: true }, { from: 2, to: 3 },
      { from: 3, to: 4, double: true }, { from: 4, to: 5 }, { from: 5, to: 0, double: true },
      { from: 0, to: 6 }, { from: 1, to: 7 }, { from: 2, to: 8 },
      { from: 3, to: 9 }, { from: 4, to: 10 }, { from: 5, to: 11 },
    ],
  },
  {
    name: "Hydrogen Sulfide", formula: "H₂S", geometry: "Bent (92°)",
    uses: "Volcanic gas, rotten-egg smell, industrial chemistry.",
    info: "H₂S is similar to water but with weaker hydrogen bonding — explaining why it's a gas at room temperature.",
    atoms: [
      { element: "S", position: [0, 0, 0], color: S, radius: 0.6 },
      { element: "H", position: [-1.0, -0.7, 0], color: H, radius: 0.3 },
      { element: "H", position: [1.0, -0.7, 0], color: H, radius: 0.3 },
    ],
    bonds: [{ from: 0, to: 1 }, { from: 0, to: 2 }],
  },
];

function Bond({ from, to, double, triple }: { from: [number, number, number]; to: [number, number, number]; double?: boolean; triple?: boolean }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

  const offsets = triple ? [-0.12, 0, 0.12] : double ? [-0.08, 0.08] : [0];

  return (
    <group position={mid} quaternion={quaternion}>
      {offsets.map((off, i) => (
        <mesh key={i} position={[off, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, length, 12]} />
          <meshPhysicalMaterial color="#94A3B8" roughness={0.15} metalness={0.7} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function MoleculeView({ molecule, selectedAtom, onSelectAtom, paused }: { molecule: MoleculeDef; selectedAtom: number | null; onSelectAtom: (i: number | null) => void; paused: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => { if (groupRef.current && !paused) groupRef.current.rotation.y += 0.005; });

  return (
    <group ref={groupRef}>
      {molecule.bonds.map((b, i) => (
        <Bond key={i} from={molecule.atoms[b.from].position} to={molecule.atoms[b.to].position} double={b.double} triple={b.triple} />
      ))}
      {molecule.atoms.map((atom, i) => (
        <group key={i} position={atom.position}>
          <mesh onClick={(e) => { e.stopPropagation(); onSelectAtom(selectedAtom === i ? null : i); }}>
            <sphereGeometry args={[atom.radius, 48, 48]} />
            <meshPhysicalMaterial
              color={atom.color}
              roughness={0.15}
              metalness={0.3}
              clearcoat={1}
              clearcoatRoughness={0.05}
              emissive={selectedAtom === i ? atom.color : "#000"}
              emissiveIntensity={selectedAtom === i ? 0.4 : 0}
            />
          </mesh>
          <Html distanceFactor={8} position={[0, atom.radius + 0.2, 0]} center style={{ pointerEvents: "none" }}>
            <span className={`text-[10px] font-bold ${selectedAtom === i ? "text-primary" : "text-foreground/70"}`}>
              {atom.element}
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
}

const Molecules3D = () => {
  const [activeMolecule, setActiveMolecule] = useState(0);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [paused, setPaused] = useState(false);
  const mol = molecules[activeMolecule];

  const next = () => { setActiveMolecule((i) => (i + 1) % molecules.length); setSelectedAtom(null); };
  const prev = () => { setActiveMolecule((i) => (i - 1 + molecules.length) % molecules.length); setSelectedAtom(null); };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/3d">
            <Button variant="ghost" size="icon" className="rounded-[10px]"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <Atom className="h-4 w-4 text-emerald-400" />
          <h1 className="text-sm font-semibold">Molecular Chemistry</h1>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">{mol.name} · {mol.formula}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-[10px] h-8 w-8" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-[10px] h-8 w-8" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="rounded-[10px] h-8 w-8" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button variant="outline" size="sm" className="rounded-[10px] text-xs" onClick={() => setSelectedAtom(null)}>
            <RotateCcw className="h-3 w-3 mr-1" /> Reset
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0f172a"]} />
          <fog attach="fog" args={["#0f172a", 12, 22]} />
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 5, 5]} intensity={1.8} castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#60a5fa" />
          <spotLight position={[0, 6, 3]} angle={0.4} penumbra={1} intensity={2} color="#e2e8f0" />
          <MoleculeView molecule={mol} selectedAtom={selectedAtom} onSelectAtom={setSelectedAtom} paused={paused} />
          <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshPhysicalMaterial color="#0f172a" roughness={0.05} metalness={0.9} />
          </mesh>
          <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={14} />
          <Environment preset="warehouse" />
        </Canvas>

        {/* Toggle panel button (always visible) */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className="absolute top-4 left-4 z-20 h-9 w-9 rounded-[10px] bg-card/90 backdrop-blur-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={panelOpen ? "Hide molecule list" : "Show molecule list"}
        >
          {panelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Collapsible molecule selector */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-16 left-4 glass-card p-3 space-y-1.5 max-h-[70vh] overflow-y-auto w-52"
            >
              <h3 className="text-xs font-semibold text-muted-foreground px-1 pb-1">Molecule Library</h3>
              {molecules.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => { setActiveMolecule(i); setSelectedAtom(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeMolecule === i ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{m.formula}</span>
                    <span className="opacity-70 text-[10px]">{m.name}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 right-4 w-72 glass-card p-4 space-y-3 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{mol.name} <span className="text-muted-foreground font-normal">({mol.formula})</span></h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-secondary/50 rounded p-2">
              <div className="text-muted-foreground">Geometry</div>
              <div className="font-semibold">{mol.geometry}</div>
            </div>
            <div className="bg-secondary/50 rounded p-2">
              <div className="text-muted-foreground">Atoms</div>
              <div className="font-semibold">{mol.atoms.length}</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{mol.info}</p>
          <div className="pt-2 border-t border-border/50">
            <h4 className="text-[10px] font-semibold text-muted-foreground mb-1">Common Uses</h4>
            <p className="text-[11px]">{mol.uses}</p>
          </div>
          <div className="pt-2 border-t border-border/50">
            <h4 className="text-[10px] font-semibold text-muted-foreground mb-1.5">Element Legend</h4>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from(new Set(mol.atoms.map(a => a.element))).map((el) => {
                const a = mol.atoms.find(x => x.element === el)!;
                return (
                  <span key={el} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-[10px]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                    {el}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
      <AIExplainPanel
        context={`Viewing molecule: ${mol.name} (${mol.formula}). Geometry: ${mol.geometry}. ${mol.info}`}
        subject="Molecular Chemistry"
      />
    </div>
  );
};

export default Molecules3D;
