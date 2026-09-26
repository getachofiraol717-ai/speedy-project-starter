// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Activity, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

/**
 * Realistic anatomical heart built from layered shapes:
 *  - Heart-shaped silhouette using a cardioid-extruded mesh
 *  - 4 internal chambers (RA, LA, RV, LV)
 *  - Major vessels: aorta (arch), pulmonary artery, vena cava, pulmonary veins
 *  - Beating animation, blood flow particles, cutaway toggle
 */

// Build a heart silhouette geometry
function useHeartGeometry() {
  return useMemo(() => {
    const heartShape = new THREE.Shape();
    // classic heart curve (parametric, inverted Y)
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const extrudeSettings = {
      depth: 0.9,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 4,
      bevelSize: 0.15,
      bevelThickness: 0.15,
      curveSegments: 32,
    };
    const geo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geo.center();
    geo.rotateZ(Math.PI);
    geo.scale(1.3, 1.3, 1.3);
    return geo;
  }, []);
}

function HeartBody({ beating, rate, cutaway, showLabels, onSelect }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const heartGeo = useHeartGeometry();
  const phaseRef = useRef(0);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (beating) {
      phaseRef.current += dt * (rate / 60) * Math.PI * 2;
      // Lub-dub: two pulses per beat
      const t = phaseRef.current;
      const pulse = 1 + 0.06 * (Math.sin(t) + 0.5 * Math.sin(t * 2 + 0.4));
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer muscle (myocardium) */}
      <mesh geometry={heartGeo} castShadow receiveShadow visible={!cutaway}>
        <meshPhysicalMaterial
          color="#a52828"
          roughness={0.55}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          sheen={0.5}
          sheenColor="#ff6677"
        />
      </mesh>

      {/* Cutaway: half-transparent muscle */}
      {cutaway && (
        <mesh geometry={heartGeo}>
          <meshPhysicalMaterial
            color="#a52828"
            transparent
            opacity={0.25}
            roughness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Internal chambers (only visible in cutaway) */}
      {cutaway && (
        <>
          {/* Left Ventricle */}
          <mesh position={[-0.35, -0.3, 0]} onClick={(e) => { e.stopPropagation(); onSelect("LV"); }}>
            <sphereGeometry args={[0.55, 32, 32]} />
            <meshPhysicalMaterial color="#7a1010" roughness={0.5} clearcoat={0.4} />
          </mesh>
          {/* Right Ventricle */}
          <mesh position={[0.45, -0.3, 0]} onClick={(e) => { e.stopPropagation(); onSelect("RV"); }}>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshPhysicalMaterial color="#3a4dd6" roughness={0.5} clearcoat={0.4} />
          </mesh>
          {/* Left Atrium */}
          <mesh position={[-0.25, 0.55, 0]} onClick={(e) => { e.stopPropagation(); onSelect("LA"); }}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshPhysicalMaterial color="#a01010" roughness={0.5} />
          </mesh>
          {/* Right Atrium */}
          <mesh position={[0.45, 0.55, 0]} onClick={(e) => { e.stopPropagation(); onSelect("RA"); }}>
            <sphereGeometry args={[0.36, 32, 32]} />
            <meshPhysicalMaterial color="#4a5fe8" roughness={0.5} />
          </mesh>
          {/* Septum (wall between L & R) */}
          <mesh position={[0.05, 0, 0]}>
            <boxGeometry args={[0.08, 1.4, 0.7]} />
            <meshStandardMaterial color="#6a1818" />
          </mesh>
        </>
      )}

      {/* Aorta arch */}
      <group position={[-0.2, 1.05, 0]}>
        <mesh rotation={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect("AORTA"); }}>
          <torusGeometry args={[0.3, 0.12, 16, 32, Math.PI]} />
          <meshPhysicalMaterial color="#c44" roughness={0.5} clearcoat={0.5} />
        </mesh>
        <mesh position={[-0.3, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
          <meshPhysicalMaterial color="#c44" roughness={0.5} />
        </mesh>
      </group>

      {/* Pulmonary artery */}
      <mesh position={[0.2, 1.0, 0.1]} rotation={[0.2, 0, 0.2]}>
        <cylinderGeometry args={[0.1, 0.13, 0.7, 16]} />
        <meshPhysicalMaterial color="#3a4dd6" roughness={0.5} />
      </mesh>

      {/* Superior vena cava */}
      <mesh position={[0.55, 1.0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.6, 16]} />
        <meshPhysicalMaterial color="#2a3aa0" roughness={0.6} />
      </mesh>

      {/* Inferior vena cava */}
      <mesh position={[0.55, -1.05, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.5, 16]} />
        <meshPhysicalMaterial color="#2a3aa0" roughness={0.6} />
      </mesh>

      {/* Pulmonary veins (2) */}
      {[-0.8, -0.5].map((x, i) => (
        <mesh key={i} position={[x, 0.7, -0.3]} rotation={[0.5, 0, -0.3]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
          <meshPhysicalMaterial color="#cc3a3a" roughness={0.5} />
        </mesh>
      ))}

      {/* Coronary arteries on surface */}
      {!cutaway && (
        <>
          <mesh position={[0, 0.3, 0.55]} rotation={[0, 0, 0.3]}>
            <torusGeometry args={[0.7, 0.025, 8, 32, Math.PI * 1.4]} />
            <meshStandardMaterial color="#ffaa55" />
          </mesh>
        </>
      )}

      {/* Labels */}
      {showLabels && (
        <>
          <Html position={[-0.5, 1.5, 0]} center distanceFactor={6}><div className="px-1.5 py-0.5 rounded bg-red-500/90 text-white text-[9px] font-semibold whitespace-nowrap pointer-events-none">Aorta</div></Html>
          <Html position={[0.25, 1.5, 0]} center distanceFactor={6}><div className="px-1.5 py-0.5 rounded bg-blue-500/90 text-white text-[9px] font-semibold whitespace-nowrap pointer-events-none">Pulmonary A.</div></Html>
          <Html position={[0.6, 1.4, 0]} center distanceFactor={6}><div className="px-1.5 py-0.5 rounded bg-blue-700/90 text-white text-[9px] font-semibold whitespace-nowrap pointer-events-none">Vena Cava</div></Html>
        </>
      )}
    </group>
  );
}

function BloodFlow({ rate, beating }: { rate: number; beating: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current || !beating) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const speed = (rate / 60) * 0.6;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += dt * speed;
      if (arr[i * 3 + 1] > 1.4) arr[i * 3 + 1] = -1.4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial color="#ff4a4a" size={0.04} transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

function ECGTrace({ rate, beating }: { rate: number; beating: boolean }) {
  // simple animated SVG line trace
  const [phase, setPhase] = useState(0);
  useFrame((_, dt) => {
    if (beating) setPhase((p) => p + dt * (rate / 60));
  });
  const pts: string[] = [];
  for (let i = 0; i < 100; i++) {
    const t = i / 100;
    const cycle = (t * 2 + phase) % 1;
    let y = 30;
    if (cycle > 0.18 && cycle < 0.22) y = 35;
    else if (cycle >= 0.22 && cycle < 0.25) y = 8;
    else if (cycle >= 0.25 && cycle < 0.28) y = 50;
    else if (cycle >= 0.28 && cycle < 0.32) y = 24;
    else if (cycle > 0.45 && cycle < 0.55) y = 28;
    pts.push(`${i * 2},${y}`);
  }
  return (
    <Html position={[0, -1.7, 0]} transform={false} fullscreen={false} center>
      <div className="bg-black/80 border border-green-500/40 rounded p-1 w-48">
        <svg viewBox="0 0 200 60" className="w-full h-12">
          <polyline points={pts.join(" ")} fill="none" stroke="#10b981" strokeWidth="1.5" />
        </svg>
        <div className="text-[8px] text-green-400 font-mono text-center">ECG • {rate} BPM</div>
      </div>
    </Html>
  );
}

const CHAMBER_INFO: Record<string, { title: string; desc: string }> = {
  LV: { title: "Left Ventricle", desc: "Pumps oxygen-rich blood to the entire body via the aorta. The thickest, most muscular chamber." },
  RV: { title: "Right Ventricle", desc: "Pumps oxygen-poor blood to the lungs via the pulmonary artery for oxygenation." },
  LA: { title: "Left Atrium", desc: "Receives oxygen-rich blood from the lungs through the pulmonary veins." },
  RA: { title: "Right Atrium", desc: "Receives oxygen-poor blood from the body via the superior and inferior vena cava." },
  AORTA: { title: "Aorta", desc: "The largest artery in the body. Carries oxygenated blood from the left ventricle to all organs." },
};

const HumanHeart3D = () => {
  const [rate, setRate] = useState(72);
  const [beating, setBeating] = useState(true);
  const [cutaway, setCutaway] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showFlow, setShowFlow] = useState(true);
  const [showECG, setShowECG] = useState(true);
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <Link to="/3d">
            <Button variant="ghost" size="icon" className="rounded-[10px]"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-destructive" />
            <h1 className="text-sm font-semibold">Human Heart Lab</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-destructive animate-pulse" />
          <span className="text-xs font-mono text-destructive">{rate} BPM</span>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 5] }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0a0508"]} />
          <fog attach="fog" args={["#0a0508", 8, 20]} />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow shadow-mapSize={2048} color="#ffeeee" />
          <pointLight position={[-3, 2, 2]} intensity={1} color="#ff7777" />
          <spotLight position={[0, 4, 0]} angle={0.4} penumbra={1} intensity={1.5} />

          <HeartBody
            beating={beating}
            rate={rate}
            cutaway={cutaway}
            showLabels={showLabels}
            onSelect={setSelectedChamber}
          />
          {showFlow && <BloodFlow rate={rate} beating={beating} />}

          <OrbitControls enablePan enableZoom minDistance={2} maxDistance={10} enableDamping />
          <Environment preset="studio" />
        </Canvas>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-4 left-4 glass-card p-3 space-y-3 w-52">
          <div className="flex items-center gap-2 pb-1 border-b border-border/40">
            <Heart className="h-3.5 w-3.5 text-destructive" />
            <span className="text-[11px] font-bold">Cardiac Controls</span>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">Heart Rate</span>
              <span className="font-mono">{rate} BPM</span>
            </div>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={40} max={180} step={1} />
            <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
              <span>Rest</span><span>Exercise</span><span>Max</span>
            </div>
          </div>
          {[
            { l: "Beating", v: beating, s: setBeating },
            { l: "Cutaway view", v: cutaway, s: setCutaway },
            { l: "Blood flow", v: showFlow, s: setShowFlow },
            { l: "Labels", v: showLabels, s: setShowLabels },
            { l: "ECG monitor", v: showECG, s: setShowECG },
          ].map((it) => (
            <div key={it.l} className="flex items-center justify-between text-[11px]">
              <span>{it.l}</span>
              <Switch checked={it.v} onCheckedChange={it.s} />
            </div>
          ))}
        </motion.div>

        {/* Chamber quick-select */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-3 py-2 flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground mr-1">Inspect:</span>
          {[["LV","LV"],["RV","RV"],["LA","LA"],["RA","RA"],["AORTA","Aorta"]].map(([k, l]) => (
            <button
              key={k}
              onClick={() => { setCutaway(true); setSelectedChamber(k); }}
              className={`px-2 py-1 rounded-md text-[10px] font-medium ${selectedChamber === k ? "bg-primary text-primary-foreground" : "bg-secondary/60 hover:bg-secondary"}`}
            >
              {l}
            </button>
          ))}
        </motion.div>

        {/* ECG monitor */}
        {showECG && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-4 right-4 glass-card p-2 w-56 bg-black/70 border-green-500/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-green-400 font-mono">ECG • SINUS RHYTHM</span>
              <span className="text-[9px] text-green-400 font-mono">{rate} BPM</span>
            </div>
            <ECGSvg rate={rate} beating={beating} />
          </motion.div>
        )}

        {/* Selected info */}
        <AnimatePresence>
          {selectedChamber && CHAMBER_INFO[selectedChamber] && (
            <motion.div
              key={selectedChamber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 right-4 w-64 glass-card p-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold">{CHAMBER_INFO[selectedChamber].title}</h3>
                <button onClick={() => setSelectedChamber(null)} className="text-muted-foreground text-xs">✕</button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{CHAMBER_INFO[selectedChamber].desc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AIExplainPanel
        context={`Viewing the human heart at ${rate} BPM. ${cutaway ? "Cutaway showing 4 chambers." : "External view."}${selectedChamber ? ` Selected: ${CHAMBER_INFO[selectedChamber]?.title}.` : ""}`}
        subject="Human Heart"
      />
    </div>
  );
};

// External SVG component for ECG (separate from the in-canvas Html version)
const ECGSvg = ({ rate, beating }: { rate: number; beating: boolean }) => {
  const [phase, setPhase] = useState(0);
  useMemo(() => {
    let raf: number;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (beating) setPhase((p) => p + dt * (rate / 60));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rate, beating]);

  const pts: string[] = [];
  for (let i = 0; i < 200; i++) {
    const t = i / 200;
    const cycle = (t * 3 + phase) % 1;
    let y = 30;
    if (cycle > 0.18 && cycle < 0.21) y = 26;
    else if (cycle >= 0.21 && cycle < 0.23) y = 8;
    else if (cycle >= 0.23 && cycle < 0.25) y = 50;
    else if (cycle >= 0.25 && cycle < 0.28) y = 22;
    else if (cycle > 0.45 && cycle < 0.52) y = 24;
    pts.push(`${i},${y}`);
  }
  return (
    <svg viewBox="0 0 200 60" className="w-full h-12">
      <polyline points={pts.join(" ")} fill="none" stroke="#10b981" strokeWidth="1.2" />
    </svg>
  );
};

export default HumanHeart3D;
