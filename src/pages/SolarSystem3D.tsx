// @ts-nocheck
import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Sparkles, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, Pause, Play, FastForward, Rewind, Eye, EyeOff, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

interface PlanetData {
  name: string;
  radius: number; // visual size
  distance: number; // orbit distance
  orbitalSpeed: number; // relative speed
  rotationSpeed: number;
  color: string;
  emissive?: string;
  ring?: { inner: number; outer: number; color: string };
  moons?: { name: string; radius: number; distance: number; speed: number; color: string }[];
  facts: { diameter: string; day: string; year: string; moons: string; temp: string; desc: string };
}

const PLANETS: PlanetData[] = [
  { name: "Mercury", radius: 0.18, distance: 4, orbitalSpeed: 1.6, rotationSpeed: 0.04, color: "#9ca3af",
    facts: { diameter: "4,879 km", day: "59 Earth days", year: "88 Earth days", moons: "0", temp: "-180°C to 430°C", desc: "Smallest planet, closest to the Sun. Extreme temperature swings." } },
  { name: "Venus", radius: 0.32, distance: 6, orbitalSpeed: 1.18, rotationSpeed: 0.01, color: "#f5cba7", emissive: "#5a2e00",
    facts: { diameter: "12,104 km", day: "243 Earth days", year: "225 Earth days", moons: "0", temp: "465°C", desc: "Hottest planet due to runaway greenhouse effect. Rotates backwards." } },
  { name: "Earth", radius: 0.34, distance: 8.4, orbitalSpeed: 1.0, rotationSpeed: 0.5, color: "#3b82f6", emissive: "#0a2540",
    moons: [{ name: "Moon", radius: 0.09, distance: 0.7, speed: 4, color: "#cbd5e1" }],
    facts: { diameter: "12,742 km", day: "24 hours", year: "365.25 days", moons: "1", temp: "15°C avg", desc: "Our home planet. The only known world with life." } },
  { name: "Mars", radius: 0.22, distance: 11, orbitalSpeed: 0.8, rotationSpeed: 0.48, color: "#cd5c5c",
    moons: [
      { name: "Phobos", radius: 0.04, distance: 0.45, speed: 6, color: "#a0a0a0" },
      { name: "Deimos", radius: 0.03, distance: 0.65, speed: 4, color: "#888888" },
    ],
    facts: { diameter: "6,779 km", day: "24.6 hours", year: "687 Earth days", moons: "2", temp: "-60°C avg", desc: "The Red Planet. Has the largest volcano (Olympus Mons) in the solar system." } },
  { name: "Jupiter", radius: 0.95, distance: 16, orbitalSpeed: 0.43, rotationSpeed: 1.2, color: "#e8a87c",
    moons: [
      { name: "Io", radius: 0.07, distance: 1.4, speed: 3.5, color: "#f4d35e" },
      { name: "Europa", radius: 0.07, distance: 1.7, speed: 2.8, color: "#e0e0e0" },
      { name: "Ganymede", radius: 0.09, distance: 2.0, speed: 2.2, color: "#a89882" },
      { name: "Callisto", radius: 0.08, distance: 2.4, speed: 1.8, color: "#5d4d3a" },
    ],
    facts: { diameter: "139,820 km", day: "10 hours", year: "12 Earth years", moons: "95", temp: "-145°C", desc: "The largest planet — a gas giant with the Great Red Spot, a storm bigger than Earth." } },
  { name: "Saturn", radius: 0.8, distance: 21, orbitalSpeed: 0.32, rotationSpeed: 1.0, color: "#f4d35e",
    ring: { inner: 1.1, outer: 1.9, color: "#d4af6e" },
    moons: [
      { name: "Titan", radius: 0.09, distance: 2.3, speed: 2.2, color: "#d49c4f" },
      { name: "Enceladus", radius: 0.05, distance: 1.5, speed: 3, color: "#f0f0f0" },
    ],
    facts: { diameter: "116,460 km", day: "10.7 hours", year: "29 Earth years", moons: "146", temp: "-178°C", desc: "Famous for its spectacular ring system made of ice and rock." } },
  { name: "Uranus", radius: 0.55, distance: 26, orbitalSpeed: 0.23, rotationSpeed: 0.4, color: "#7fdbff",
    ring: { inner: 1.3, outer: 1.55, color: "#6caec5" },
    moons: [
      { name: "Titania", radius: 0.06, distance: 1.7, speed: 2, color: "#b0a89c" },
      { name: "Oberon", radius: 0.06, distance: 2.0, speed: 1.6, color: "#9c9082" },
    ],
    facts: { diameter: "50,724 km", day: "17 hours", year: "84 Earth years", moons: "27", temp: "-224°C", desc: "Ice giant tipped on its side — rotates almost perpendicular to its orbit." } },
  { name: "Neptune", radius: 0.54, distance: 31, orbitalSpeed: 0.18, rotationSpeed: 0.45, color: "#4b70dd",
    moons: [{ name: "Triton", radius: 0.07, distance: 1.5, speed: 2.5, color: "#c8c0b0" }],
    facts: { diameter: "49,244 km", day: "16 hours", year: "165 Earth years", moons: "14", temp: "-218°C", desc: "Windiest planet — supersonic storms reach 2,100 km/h." } },
];

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05; });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#ffd966" toneMapped={false} />
      </mesh>
      {/* Corona glow */}
      <mesh>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#ff9933" transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#ff6633" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <Sparkles count={40} scale={4} size={6} color="#ffaa00" speed={0.4} />
      <pointLight intensity={3.5} distance={80} decay={1.4} color="#ffe9b0" />
    </group>
  );
}

function Planet({ data, speed, showOrbit, showMoons, showLabels, onSelect, focused, registerPos }: {
  data: PlanetData; speed: number; showOrbit: boolean; showMoons: boolean; showLabels: boolean;
  onSelect: (p: PlanetData, pos: THREE.Vector3) => void; focused: string | null;
  registerPos: (name: string, pos: THREE.Vector3, radius: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, dt) => {
    angleRef.current += dt * data.orbitalSpeed * 0.15 * speed;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * data.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * data.distance;
      const wp = new THREE.Vector3();
      groupRef.current.getWorldPosition(wp);
      registerPos(data.name, wp, data.radius);
    }
    if (meshRef.current) meshRef.current.rotation.y += dt * data.rotationSpeed * speed;
  });

  const orbitGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * data.distance, 0, Math.sin(t) * data.distance));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [data.distance]);

  return (
    <>
      {showOrbit && (
        <line geometry={orbitGeometry}>
          <lineBasicMaterial color="#3b3b5c" transparent opacity={0.4} />
        </line>
      )}
      <group ref={groupRef}>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            const worldPos = new THREE.Vector3();
            groupRef.current?.getWorldPosition(worldPos);
            onSelect(data, worldPos);
          }}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <sphereGeometry args={[data.radius, 48, 48]} />
          <meshPhysicalMaterial
            color={data.color}
            emissive={data.emissive || "#000000"}
            emissiveIntensity={0.15}
            roughness={0.85}
            metalness={0.05}
            clearcoat={data.name === "Earth" ? 0.4 : 0}
          />
        </mesh>

        {(data.name === "Earth" || data.name === "Venus") && (
          <mesh scale={1.08}>
            <sphereGeometry args={[data.radius, 32, 32]} />
            <meshBasicMaterial color={data.name === "Earth" ? "#7eb8ff" : "#fff2cc"} transparent opacity={0.18} side={THREE.BackSide} />
          </mesh>
        )}

        {data.ring && (
          <mesh rotation={[Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[data.radius * data.ring.inner, data.radius * data.ring.outer, 96]} />
            <meshBasicMaterial color={data.ring.color} side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        )}

        {showMoons && data.moons?.map((moon) => (
          <Moon key={moon.name} moon={moon} parentRadius={data.radius} speed={speed} showLabels={showLabels} />
        ))}

        {showLabels && (
          <Html position={[0, data.radius + 0.3, 0]} center distanceFactor={focused === data.name ? 4 : 12}>
            <div className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap pointer-events-none ${
              focused === data.name ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground border border-border"
            }`}>
              {data.name}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

function Moon({ moon, parentRadius, speed, showLabels }: any) {
  const ref = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  useFrame((_, dt) => {
    angleRef.current += dt * moon.speed * 0.3 * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(angleRef.current) * (parentRadius + moon.distance);
      ref.current.position.z = Math.sin(angleRef.current) * (parentRadius + moon.distance);
    }
  });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[moon.radius, 24, 24]} />
        <meshStandardMaterial color={moon.color} roughness={0.9} />
      </mesh>
      {showLabels && (
        <Html position={[0, moon.radius + 0.1, 0]} center distanceFactor={8}>
          <div className="px-1 py-0 rounded text-[8px] text-muted-foreground bg-background/50 pointer-events-none whitespace-nowrap">{moon.name}</div>
        </Html>
      )}
    </group>
  );
}

function CameraRig({ focused, positions, controlsRef }: {
  focused: string | null;
  positions: React.MutableRefObject<Record<string, { pos: THREE.Vector3; radius: number }>>;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera, size } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const desiredCam = useRef(new THREE.Vector3(0, 18, 35));

  // Responsive: pull camera back & widen FOV on narrow / portrait viewports so all 8 planets fit.
  useFrame(() => {
    const aspect = size.width / Math.max(1, size.height);
    const isPortrait = aspect < 1;
    // Neptune sits at distance ~31, so pull way back on phones to fit all 8 planets.
    const portraitScale = Math.max(1, 1 / Math.max(aspect, 0.45));
    const overviewDist = isPortrait ? 60 * portraitScale : 38;
    const overviewY = isPortrait ? 32 * portraitScale : 18;
    const targetFov = isPortrait ? Math.min(85, 60 + (1 - aspect) * 25) : 55;

    if ((camera as THREE.PerspectiveCamera).fov !== undefined) {
      const persp = camera as THREE.PerspectiveCamera;
      if (Math.abs(persp.fov - targetFov) > 0.5) {
        persp.fov += (targetFov - persp.fov) * 0.1;
        persp.updateProjectionMatrix();
      }
    }

    if (focused && positions.current[focused]) {
      const { pos, radius } = positions.current[focused];
      targetPos.current.copy(pos);
      const dist = Math.max(radius * (isPortrait ? 9 : 6), 2.2);
      desiredCam.current.set(pos.x + dist, pos.y + dist * 0.5, pos.z + dist);
    } else {
      targetPos.current.set(0, 0, 0);
      desiredCam.current.set(0, overviewY, overviewDist);
    }
    camera.position.lerp(desiredCam.current, 0.06);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetPos.current, 0.1);
      controlsRef.current.update();
    }
  });
  return null;
}

const SolarSystem3D = () => {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showMoons, setShowMoons] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selected, setSelected] = useState<PlanetData | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const positionsRef = useRef<Record<string, { pos: THREE.Vector3; radius: number }>>({});
  const controlsRef = useRef<any>(null);

  const effectiveSpeed = paused ? 0 : speed;

  const registerPos = (name: string, pos: THREE.Vector3, radius: number) => {
    positionsRef.current[name] = { pos: pos.clone(), radius };
  };

  return (
    <div className="h-[100dvh] bg-black flex flex-col">
      <header className="border-b border-border/30 flex items-center justify-between gap-2 px-3 sm:px-6 py-2 shrink-0 bg-card/30 backdrop-blur-xl z-10 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Link to="/3d">
            <Button variant="ghost" size="icon" className="rounded-[10px] h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h1 className="text-xs sm:text-sm font-semibold truncate">Solar System</h1>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {focused && (
            <Button variant="outline" size="sm" className="rounded-[10px] h-7 text-[10px] px-2" onClick={() => { setFocused(null); setSelected(null); }}>
              Reset
            </Button>
          )}
          <Button variant={paused ? "default" : "outline"} size="sm" className="rounded-[10px] h-7 w-7 p-0" onClick={() => setPaused(!paused)}>
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <div className="flex items-center gap-1 px-1">
            <Rewind className="h-3 w-3 text-muted-foreground hidden sm:block" />
            <Slider value={[speed]} onValueChange={(v) => setSpeed(v[0])} min={0.1} max={5} step={0.1} className="w-16 sm:w-20" />
            <FastForward className="h-3 w-3 text-muted-foreground hidden sm:block" />
            <span className="text-[10px] text-muted-foreground font-mono w-8">{speed.toFixed(1)}×</span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 18, 35], fov: 55 }} dpr={[1, 2]}>
          <color attach="background" args={["#000005"]} />
          <fog attach="fog" args={["#000005", 60, 120]} />
          <ambientLight intensity={0.08} />
          <Stars radius={150} depth={60} count={6000} factor={5} saturation={0.4} fade speed={0.5} />
          <Sun />
          {PLANETS.map((p) => (
            <Planet
              key={p.name}
              data={p}
              speed={effectiveSpeed}
              showOrbit={showOrbits}
              showMoons={showMoons}
              showLabels={showLabels}
              onSelect={(pl) => { setSelected(pl); setFocused(pl.name); }}
              focused={focused}
              registerPos={registerPos}
            />
          ))}
          <CameraRig focused={focused} positions={positionsRef} controlsRef={controlsRef} />
          <OrbitControls
            ref={controlsRef}
            enablePan
            enableZoom
            minDistance={1}
            maxDistance={200}
            enableDamping
            dampingFactor={0.08}
          />
          <Environment preset="night" background={false} />
        </Canvas>

        {/* Layer toggles */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-2 left-2 glass-card p-2 sm:p-3 space-y-1.5 sm:space-y-2 w-32 sm:w-44">
          <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold">View</span>
          </div>
          {[
            { l: "Orbits", v: showOrbits, s: setShowOrbits },
            { l: "Moons", v: showMoons, s: setShowMoons },
            { l: "Labels", v: showLabels, s: setShowLabels },
          ].map((it) => (
            <div key={it.l} className="flex items-center justify-between text-[11px]">
              <span>{it.l}</span>
              <Switch checked={it.v} onCheckedChange={it.s} />
            </div>
          ))}
        </motion.div>

        {/* Planet quick-select */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-3 py-2 flex items-center gap-1.5 max-w-[90vw] overflow-x-auto">
          <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {PLANETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setSelected(p); setFocused(p.name); }}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${
                focused === p.name ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </motion.div>

        {/* Info panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-2 right-2 w-[calc(100vw-1rem)] sm:w-72 max-w-xs glass-card p-3 sm:p-4 space-y-2 sm:space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ background: selected.color }} />
                    <h3 className="text-sm font-bold">{selected.name}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{selected.facts.desc}</p>
                </div>
                <button onClick={() => { setSelected(null); setFocused(null); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {[
                  ["Diameter", selected.facts.diameter],
                  ["Day", selected.facts.day],
                  ["Year", selected.facts.year],
                  ["Moons", selected.facts.moons],
                  ["Temp", selected.facts.temp],
                ].map(([k, v]) => (
                  <div key={k} className="bg-secondary/40 rounded-md p-1.5">
                    <div className="text-muted-foreground">{k}</div>
                    <div className="font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              {selected.moons && selected.moons.length > 0 && (
                <div className="pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground mb-1">Major Moons</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.moons.map((m) => (
                      <span key={m.name} className="px-1.5 py-0.5 bg-secondary rounded text-[9px]">{m.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 right-2 glass-card p-2 sm:p-3 max-w-[180px] sm:max-w-xs">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold">Click a planet</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Click any planet to see its data, moons, and zoom in.</p>
          </motion.div>
        )}
      </div>

      <AIExplainPanel
        context={selected ? `Currently focused on ${selected.name}: ${selected.facts.desc}` : "Viewing the full Solar System with 8 planets and their moons"}
        subject="Solar System"
      />
    </div>
  );
};

export default SolarSystem3D;
