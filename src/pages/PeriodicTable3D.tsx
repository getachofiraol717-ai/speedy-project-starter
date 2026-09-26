// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Html, Text } from "@react-three/drei";
import { ArrowLeft, Atom, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AIExplainPanel from "@/components/3d/AIExplainPanel";
import * as THREE from "three";

import { elements as ALL_ELEMENTS, cat, type Element } from "@/data/periodicTable";

const elements = ALL_ELEMENTS;

function ElementCard3D({ element, selected, hovered, onClick, dim }: { element: Element; selected: boolean; hovered: boolean; onClick: () => void; dim: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  // tighter grid for 118 elements; row 8/9 = lanthanides/actinides offset down
  const x = (element.col - 8.5) * 0.55;
  const yRow = element.row >= 8 ? element.row + 0.4 : element.row;
  const y = (4.5 - yRow) * 0.65;

  useFrame((_, delta) => {
    if (ref.current) {
      const targetY = selected ? 0.35 : hovered ? 0.12 : 0;
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, y + targetY, delta * 6);
    }
  });

  return (
    <mesh ref={ref} position={[x, y, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <boxGeometry args={[0.48, 0.58, 0.06]} />
      <meshPhysicalMaterial
        color={element.color}
        transparent
        opacity={dim ? 0.18 : 1}
        roughness={0.18}
        metalness={selected ? 0.7 : 0.2}
        clearcoat={1}
        clearcoatRoughness={0.05}
        emissive={selected ? element.color : "#000"}
        emissiveIntensity={selected ? 0.6 : hovered ? 0.25 : 0}
      />
      {/* Atomic number */}
      <Text position={[-0.18, 0.22, 0.04]} fontSize={0.05} color="#ffffff" anchorX="left" anchorY="middle" fillOpacity={dim ? 0.3 : 0.9}>
        {String(element.number)}
      </Text>
      {/* Symbol */}
      <Text position={[0, 0.05, 0.04]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle" fontWeight={800} fillOpacity={dim ? 0.35 : 1} outlineWidth={0.004} outlineColor="#000000">
        {element.symbol}
      </Text>
      {/* Name */}
      <Text position={[0, -0.13, 0.04]} fontSize={0.045} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={0.45} fillOpacity={dim ? 0.3 : 0.95} outlineWidth={0.002} outlineColor="#000000">
        {element.name}
      </Text>
      {/* Mass */}
      <Text position={[0, -0.22, 0.04]} fontSize={0.035} color="#ffffff" anchorX="center" anchorY="middle" fillOpacity={dim ? 0.25 : 0.7}>
        {element.mass}
      </Text>
    </mesh>
  );
}

function AtomModel({ element }: { element: Element }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (groupRef.current) groupRef.current.rotation.y += delta * 0.5; });

  const shellRadii = [0.35, 0.7, 1.05, 1.4, 1.75, 2.1, 2.45];

  return (
    <group ref={groupRef} position={[6.5, 1, 0]}>
      <mesh>
        <sphereGeometry args={[0.22, 48, 48]} />
        <meshPhysicalMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.7} roughness={0.15} clearcoat={1} />
      </mesh>
      <Html distanceFactor={5} position={[0, -0.45, 0]} center>
        <span className="text-[9px] font-bold text-red-400">Nucleus</span>
      </Html>
      {element.electrons.map((count, shell) => (
        <group key={shell}>
          <mesh rotation={[Math.PI / 2 + shell * 0.2, 0, shell * 0.3]}>
            <torusGeometry args={[shellRadii[shell] || 2.5, 0.005, 8, 128]} />
            <meshPhysicalMaterial color={element.color} transparent opacity={0.4} metalness={0.5} emissive={element.color} emissiveIntensity={0.3} />
          </mesh>
          {Array.from({ length: Math.min(count, 12) }, (_, e) => {
            const angle = (e / Math.min(count, 12)) * Math.PI * 2;
            const r = shellRadii[shell] || 2.5;
            return (
              <Float key={e} speed={3 + shell} floatIntensity={0.05}>
                <mesh position={[Math.cos(angle) * r, Math.sin(angle * 0.5) * 0.1, Math.sin(angle) * r]}>
                  <sphereGeometry args={[0.06, 24, 24]} />
                  <meshPhysicalMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} clearcoat={1} />
                </mesh>
              </Float>
            );
          })}
        </group>
      ))}
    </group>
  );
}

const PeriodicTable3D = () => {
  const [selected, setSelected] = useState<Element | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const matchedSymbols = useMemo(() => new Set(
    elements.filter(el =>
      (!search || el.name.toLowerCase().includes(search.toLowerCase()) || el.symbol.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCategory || el.category === filterCategory)
    ).map(el => el.symbol)
  ), [search, filterCategory]);

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Atom className="h-4 w-4 text-cyan-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Periodic Table</h1>
        <div className="ml-auto relative w-32 sm:w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 h-8 rounded-lg text-xs" />
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 12], fov: 55 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={55} />
          <color attach="background" args={["#0a0a1a"]} />
          <fog attach="fog" args={["#0a0a1a", 22, 40]} />
          <ambientLight intensity={0.22} />
          <hemisphereLight args={["#e0e7ff", "#1e1b4b", 0.3]} />
          <spotLight position={[0, 10, 5]} angle={0.5} penumbra={0.8} intensity={3} color="#e2e8f0" castShadow shadow-mapSize={2048} />
          {elements.map((el) => (
            <ElementCard3D
              key={el.symbol}
              element={el}
              selected={selected?.symbol === el.symbol}
              hovered={hovered === el.symbol}
              dim={!matchedSymbols.has(el.symbol)}
              onClick={() => setSelected(selected?.symbol === el.symbol ? null : el)}
            />
          ))}
          {selected && <AtomModel element={selected} />}
          <OrbitControls enablePan minDistance={4} maxDistance={26} />
          <Environment preset="studio" />
        </Canvas>

        {/* Category filter */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-2 flex flex-wrap gap-1 max-w-[280px]">
          <button onClick={() => setFilterCategory(null)} className={`px-2 py-1 rounded text-[9px] font-medium ${!filterCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
          {Object.entries(cat).map(([k, c]) => (
            <button key={k} onClick={() => setFilterCategory(filterCategory === k ? null : k)} className="px-2 py-1 rounded text-[9px] font-medium flex items-center gap-1" style={{ backgroundColor: filterCategory === k ? c : c + "22", color: filterCategory === k ? "#fff" : c }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
              {k.replace("-", " ")}
            </button>
          ))}
        </div>

        {selected && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-[calc(100%-1.5rem)] sm:max-w-xs bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
              <span className="text-sm font-bold">{selected.name}</span>
              <Badge variant="outline" className="text-[9px]">{selected.category.replace("-", " ")}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Atomic #:</span> <span className="font-medium">{selected.number}</span></div>
              <div><span className="text-muted-foreground">Mass:</span> <span className="font-medium">{selected.mass}</span></div>
              <div className="col-span-2"><span className="text-muted-foreground">Shells:</span> <span className="font-medium">{selected.electrons.join("-")}</span></div>
            </div>
            <p className="text-[11px] text-muted-foreground">{selected.description}</p>
          </div>
        )}

        <AIExplainPanel context={`3D Periodic Table with all 118 elements. ${selected ? `Selected: ${selected.name} (${selected.symbol}), atomic # ${selected.number}, ${selected.category}. ${selected.description}` : "Click any element."}`} subject="Periodic Table" />
      </div>
    </div>
  );
};

export default PeriodicTable3D;
