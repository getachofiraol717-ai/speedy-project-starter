// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Trail } from "@react-three/drei";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Info, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

function Pendulum({ length, gravity, damping }: { length: number; gravity: number; damping: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const angleRef = useRef(Math.PI / 4);
  const velRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const acc = -(gravity / length) * Math.sin(angleRef.current);
    velRef.current += acc * dt;
    velRef.current *= 1 - damping * dt;
    angleRef.current += velRef.current * dt;
    if (groupRef.current) groupRef.current.rotation.z = angleRef.current;
  });

  const period = 2 * Math.PI * Math.sqrt(length / gravity);

  return (
    <group ref={groupRef} position={[0, 5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, length, 12]} />
        <meshPhysicalMaterial color="#94A3B8" metalness={0.8} roughness={0.15} />
      </mesh>
      <mesh position={[0, length / 2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial color="#64748B" metalness={0.9} roughness={0.1} />
      </mesh>
      <Trail width={0.5} color="#6366F1" length={10} decay={1} attenuation={(t) => t * t}>
        <mesh position={[0, -length / 2, 0]} castShadow>
          <sphereGeometry args={[0.32, 48, 48]} />
          <meshPhysicalMaterial color="#6366F1" metalness={0.6} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} emissive="#6366F1" emissiveIntensity={0.2} />
        </mesh>
      </Trail>
    </group>
  );
}

function FallingBalls({ gravity, restitution }: { gravity: number; restitution: number }) {
  const balls = useRef([
    { pos: new THREE.Vector3(-2, 5, 0), vel: 0, mass: 0.45, color: "#EF4444" },
    { pos: new THREE.Vector3(-0.5, 7, 0), vel: 0, mass: 0.32, color: "#F59E0B" },
    { pos: new THREE.Vector3(1, 6, 0), vel: 0, mass: 0.4, color: "#10B981" },
    { pos: new THREE.Vector3(2.5, 8, 0), vel: 0, mass: 0.5, color: "#3B82F6" },
  ]);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    balls.current.forEach((b, i) => {
      b.vel -= gravity * dt;
      b.pos.y += b.vel * dt;
      if (b.pos.y < b.mass) {
        b.pos.y = b.mass;
        b.vel = -b.vel * restitution;
      }
      if (meshRefs.current[i]) meshRefs.current[i].position.copy(b.pos);
    });
  });

  return (
    <>
      {balls.current.map((b, i) => (
        <mesh key={i} ref={(el) => { if (el) meshRefs.current[i] = el; }} position={b.pos} castShadow>
          <sphereGeometry args={[b.mass, 48, 48]} />
          <meshPhysicalMaterial color={b.color} metalness={0.4} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} emissive={b.color} emissiveIntensity={0.15} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshPhysicalMaterial color="#1E293B" roughness={0.05} metalness={0.9} />
      </mesh>
    </>
  );
}

function WaveVisualization({ frequency, amplitude }: { frequency: number; amplitude: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo = useRef(new THREE.PlaneGeometry(10, 5, 100, 50));

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geo.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * frequency + t * 3) * amplitude + Math.sin(y * frequency * 0.7 + t * 2) * amplitude * 0.6);
    }
    pos.needsUpdate = true;
    geo.current.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} geometry={geo.current} rotation={[-Math.PI / 4, 0, 0]} position={[0, 1.5, -3]} castShadow>
      <meshPhysicalMaterial color="#818CF8" roughness={0.1} metalness={0.7} clearcoat={0.9} side={THREE.DoubleSide} emissive="#6366F1" emissiveIntensity={0.15} />
    </mesh>
  );
}

function Projectile({ velocity, angle, gravity }: { velocity: number; angle: number; gravity: number }) {
  const ballRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef({ pos: new THREE.Vector3(-4, 0.5, 0), vel: new THREE.Vector3(velocity * Math.cos(angle), velocity * Math.sin(angle), 0) });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = stateRef.current;
    s.vel.y -= gravity * dt;
    s.pos.add(s.vel.clone().multiplyScalar(dt));
    if (s.pos.y < 0.3 || s.pos.x > 6) {
      s.pos.set(-4, 0.5, 0);
      s.vel.set(velocity * Math.cos(angle), velocity * Math.sin(angle), 0);
    }
    if (ballRef.current) ballRef.current.position.copy(s.pos);
  });

  return (
    <>
      <Trail width={0.4} color="#f97316" length={8} decay={1.5}>
        <mesh ref={ballRef} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshPhysicalMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.4} clearcoat={1} />
        </mesh>
      </Trail>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 6]} />
        <meshPhysicalMaterial color="#1E293B" roughness={0.05} metalness={0.9} />
      </mesh>
    </>
  );
}

type Demo = "pendulum" | "gravity" | "waves" | "projectile";

const Physics3D = () => {
  const [demo, setDemo] = useState<Demo>("pendulum");
  const [key, setKey] = useState(0);
  const [length, setLength] = useState(3);
  const [gravity, setGravity] = useState(9.8);
  const [damping, setDamping] = useState(0.05);
  const [restitution, setRestitution] = useState(0.7);
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(0.4);
  const [velocity, setVelocity] = useState(8);
  const [angle, setAngle] = useState(60);

  const demoInfo: Record<Demo, { title: string; desc: string; formula?: string }> = {
    pendulum: { title: "Simple Pendulum", desc: "Periodic motion under gravity. Period depends on length & gravity, not mass.", formula: `T = 2π√(L/g) = ${(2 * Math.PI * Math.sqrt(length / gravity)).toFixed(2)}s` },
    gravity: { title: "Gravity & Bouncing", desc: "Free-fall under gravity. Coefficient of restitution determines bounce energy retention.", formula: `KE = ½mv² · e²ⁿ (e=${restitution})` },
    waves: { title: "Wave Interference", desc: "Two superposed sine waves create complex interference patterns.", formula: `y = A·sin(kx + ωt)` },
    projectile: { title: "Projectile Motion", desc: "Independent horizontal & vertical motion. Range maximized at 45°.", formula: `R = v²·sin(2θ)/g = ${(velocity * velocity * Math.sin(2 * angle * Math.PI / 180) / gravity).toFixed(1)}m` },
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <header className="h-12 sm:h-14 border-b border-border/50 flex items-center px-3 sm:px-4 bg-card/80 backdrop-blur-xl z-10 gap-2">
        <Link to="/3d"><Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <Zap className="h-4 w-4 text-purple-500 shrink-0" />
        <h1 className="text-sm font-bold truncate">Physics Lab</h1>
        <div className="ml-auto flex items-center gap-1 overflow-x-auto">
          {(["pendulum", "gravity", "waves", "projectile"] as Demo[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDemo(d); setKey((k) => k + 1); }}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors capitalize whitespace-nowrap ${
                demo === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
          <Button variant="outline" size="icon" className="rounded-lg h-8 w-8 shrink-0 ml-1" onClick={() => setKey((k) => k + 1)}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas key={key} camera={{ position: [0, 4, 11], fov: 50 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={50} />
          <color attach="background" args={["#0f172a"]} />
          <fog attach="fog" args={["#0f172a", 18, 35]} />
          <ambientLight intensity={0.15} />
          <directionalLight position={[5, 8, 5]} intensity={2} castShadow shadow-mapSize={2048} />
          <directionalLight position={[-3, 3, -3]} intensity={0.4} color="#818cf8" />
          <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1.5} color="#e2e8f0" />
          {demo === "pendulum" && <Pendulum length={length} gravity={gravity} damping={damping} />}
          {demo === "gravity" && <FallingBalls gravity={gravity} restitution={restitution} />}
          {demo === "waves" && <WaveVisualization frequency={frequency} amplitude={amplitude} />}
          {demo === "projectile" && <Projectile velocity={velocity} angle={angle * Math.PI / 180} gravity={gravity} />}
          <gridHelper args={[24, 24, "#334155", "#1E293B"]} position={[0, 0.01, 0]} />
          <OrbitControls enablePan enableZoom minDistance={3} maxDistance={22} target={[0, 2, 0]} />
          <Environment preset="warehouse" />
        </Canvas>

        {/* Param panel */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 w-60 space-y-2.5">
          <h3 className="text-[11px] font-semibold flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-purple-500" /> Parameters
          </h3>
          {demo === "pendulum" && (<>
            <ParamSlider label="Length (m)" value={length} setValue={setLength} min={0.5} max={6} step={0.1} />
            <ParamSlider label="Gravity (m/s²)" value={gravity} setValue={setGravity} min={1} max={25} step={0.1} />
            <ParamSlider label="Damping" value={damping} setValue={setDamping} min={0} max={0.3} step={0.01} />
          </>)}
          {demo === "gravity" && (<>
            <ParamSlider label="Gravity (m/s²)" value={gravity} setValue={setGravity} min={1} max={25} step={0.1} />
            <ParamSlider label="Bounciness" value={restitution} setValue={setRestitution} min={0} max={1} step={0.05} />
          </>)}
          {demo === "waves" && (<>
            <ParamSlider label="Frequency" value={frequency} setValue={setFrequency} min={0.5} max={5} step={0.1} />
            <ParamSlider label="Amplitude" value={amplitude} setValue={setAmplitude} min={0.05} max={1} step={0.05} />
          </>)}
          {demo === "projectile" && (<>
            <ParamSlider label="Velocity (m/s)" value={velocity} setValue={setVelocity} min={3} max={15} step={0.5} />
            <ParamSlider label="Angle (°)" value={angle} setValue={setAngle} min={10} max={85} step={1} />
            <ParamSlider label="Gravity" value={gravity} setValue={setGravity} min={1} max={25} step={0.1} />
          </>)}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-64 max-w-[calc(100%-1.5rem)] glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{demoInfo[demo].title}</h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{demoInfo[demo].desc}</p>
          {demoInfo[demo].formula && (
            <div className="bg-secondary/50 rounded p-2 text-[10px] font-mono text-primary">{demoInfo[demo].formula}</div>
          )}
        </motion.div>
      </div>
      <AIExplainPanel
        context={`Physics simulation: ${demoInfo[demo].title}. ${demoInfo[demo].desc} ${demoInfo[demo].formula || ""}`}
        subject="Physics Simulations"
      />
    </div>
  );
};

function ParamSlider({ label, value, setValue, min, max, step }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono">{value.toFixed(2)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => setValue(v[0])} />
    </div>
  );
}

export default Physics3D;
