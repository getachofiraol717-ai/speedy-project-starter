// @ts-nocheck
import ResponsiveCamera from "@/components/3d/ResponsiveCamera";
import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Environment, ContactShadows, Outlines } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Layers, Info, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import * as THREE from "three";
import AIExplainPanel from "@/components/3d/AIExplainPanel";

type BodyLayer = "skin" | "muscles" | "skeleton" | "organs" | "cells";

const layerConfig: { id: BodyLayer; label: string; color: string; emoji: string }[] = [
  { id: "skin", label: "Skin", color: "#FFD3A8", emoji: "🧑" },
  { id: "muscles", label: "Muscles", color: "#FF5A6E", emoji: "💪" },
  { id: "skeleton", label: "Skeleton", color: "#FFF8E1", emoji: "🦴" },
  { id: "organs", label: "Organs", color: "#FF7AA2", emoji: "🫀" },
  { id: "cells", label: "Cells", color: "#7DD3FC", emoji: "🔬" },
];

/* Anime-style toon gradient ramp — soft 2-step cel shading */
const toonGradient = (() => {
  const data = new Uint8Array([200, 200, 200, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 2, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

const organData = [
  { name: "Brain", position: [0, 3.75, 0.04] as [number, number, number], size: [0.28, 0.22, 0.24], color: "#FFB3C7", info: "The brain has ~86 billion neurons controlling cognition, memory, emotions, and motor functions." },
  { name: "Heart", position: [-0.12, 2.08, 0.33] as [number, number, number], size: [0.15, 0.2, 0.14], color: "#FF3B57", info: "The heart beats ~100,000 times/day pumping ~7,500 liters of blood." },
  { name: "Left Lung", position: [-0.32, 2.35, 0.1] as [number, number, number], size: [0.22, 0.42, 0.16], color: "#FF9BB8", info: "The left lung has 2 lobes. Lungs have ~480 million alveoli." },
  { name: "Right Lung", position: [0.34, 2.35, 0.1] as [number, number, number], size: [0.24, 0.45, 0.17], color: "#FF9BB8", info: "The right lung has 3 lobes and is slightly larger." },
  { name: "Liver", position: [0.26, 1.52, 0.28] as [number, number, number], size: [0.35, 0.17, 0.18], color: "#B5471F", info: "The liver performs 500+ functions including detoxification and bile production." },
  { name: "Stomach", position: [-0.22, 1.34, 0.31] as [number, number, number], size: [0.18, 0.21, 0.14], color: "#FFB088", info: "The stomach uses HCl acid (pH 1.5-3.5) to digest food." },
  { name: "Kidneys", position: [0, 0.92, -0.18] as [number, number, number], size: [0.14, 0.2, 0.08], color: "#C9362E", info: "Kidneys filter ~180 liters of blood daily." },
  { name: "Intestines", position: [0, 0.55, 0.22] as [number, number, number], size: [0.38, 0.3, 0.19], color: "#FFA5BD", info: "Small intestine ~6m, large intestine ~1.5m long." },
];

/* ── Neutral male anatomical body: built to match the overlay coordinate system ── */
function SkinLayer({ opacity }: { opacity: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0004; });

  const skinMat = useMemo(() => ({
    color: "#FFE3CC",
    gradientMap: toonGradient,
    transparent: true,
    opacity,
    emissive: "#FFB89A",
    emissiveIntensity: 0.12,
  }), [opacity]);

  const detailOpacity = opacity * 0.75;

  return (
    <group ref={ref}>
      {/* Head and face — anime style */}
      <mesh position={[0, 3.7, 0.02]} scale={[0.78, 1, 0.68]}>
        <sphereGeometry args={[0.38, 40, 40]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      {/* Anime hair cap */}
      <mesh position={[0, 3.88, -0.02]} scale={[0.85, 0.95, 0.78]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshToonMaterial color="#2A1F3D" gradientMap={toonGradient} transparent opacity={detailOpacity} />
      </mesh>
      {/* Hair bangs */}
      {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
        <mesh key={`bang-${i}`} position={[x, 4.0, 0.32]} rotation={[0.3, 0, x * 0.8]} scale={[0.6, 1, 0.3]}>
          <coneGeometry args={[0.07, 0.22, 8]} />
          <meshToonMaterial color="#2A1F3D" gradientMap={toonGradient} transparent opacity={detailOpacity} />
        </mesh>
      ))}
      {/* Jaw */}
      <mesh position={[0, 3.38, 0.04]} scale={[1.12, 0.38, 0.72]}>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 3.56, 0.37]} scale={[0.45, 1, 0.6]}>
        <coneGeometry args={[0.06, 0.16, 16]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      {/* Anime eyes — big oval whites with dark pupils */}
      {[-0.13, 0.13].map(x => (
        <group key={`face-${x}`}>
          <mesh position={[x, 3.66, 0.36]} scale={[1.2, 1.4, 0.4]}>
            <sphereGeometry args={[0.06, 20, 20]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={detailOpacity} />
          </mesh>
          <mesh position={[x, 3.65, 0.4]} scale={[0.9, 1.3, 0.4]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshToonMaterial color="#1E1B4B" transparent opacity={detailOpacity} />
          </mesh>
          {/* Eye highlight */}
          <mesh position={[x + 0.012, 3.69, 0.42]}>
            <sphereGeometry args={[0.013, 10, 10]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={detailOpacity} />
          </mesh>
          {/* Thin brow */}
          <mesh position={[x, 3.78, 0.38]} rotation={[0, 0, x > 0 ? -0.15 : 0.15]} scale={[1, 0.3, 0.3]}>
            <capsuleGeometry args={[0.012, 0.07, 4, 8]} />
            <meshToonMaterial color="#2A1F3D" transparent opacity={detailOpacity} />
          </mesh>
        </group>
      ))}
      {/* Small mouth */}
      <mesh position={[0, 3.42, 0.4]} scale={[1, 0.25, 0.2]}>
        <capsuleGeometry args={[0.018, 0.05, 4, 8]} />
        <meshToonMaterial color="#D97A85" transparent opacity={detailOpacity} />
      </mesh>

      {/* Neck, shoulders, chest, abdomen and pelvis */}
      <mesh position={[0, 3.12, 0.02]}>
        <cylinderGeometry args={[0.16, 0.19, 0.45, 32]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      <mesh position={[0, 2.63, 0]} scale={[1.18, 0.45, 0.48]}>
        <sphereGeometry args={[0.55, 40, 40]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      <mesh position={[0, 2.02, 0.02]} scale={[0.95, 1.05, 0.5]}>
        <capsuleGeometry args={[0.42, 0.72, 18, 36]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      <mesh position={[0, 1.22, 0.02]} scale={[0.74, 0.9, 0.44]}>
        <capsuleGeometry args={[0.38, 0.72, 18, 36]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      <mesh position={[0, 0.48, 0]} scale={[0.88, 0.45, 0.46]}>
        <sphereGeometry args={[0.48, 36, 36]} />
        <meshToonMaterial {...skinMat} />
      </mesh>
      {[-0.23, 0.23].map(x => (
        <mesh key={`pec-skin-${x}`} position={[x, 2.38, 0.28]} scale={[1.1, 0.52, 0.28]}>
          <sphereGeometry args={[0.2, 28, 28]} />
          <meshToonMaterial {...skinMat} />
        </mesh>
      ))}
      <mesh position={[0, 1.22, 0.4]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshToonMaterial color="#855943" roughness={0.8} transparent opacity={detailOpacity} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={`collar-skin-${side}`} position={[side * 0.28, 2.86, 0.22]} rotation={[0.08, 0, side * 0.28]}>
          <capsuleGeometry args={[0.018, 0.35, 5, 12]} />
          <meshToonMaterial color="#A87558" roughness={0.7} transparent opacity={detailOpacity} />
        </mesh>
      ))}

      {/* Arms with relaxed anatomical pose */}
      {[-1, 1].map(side => (
        <group key={`skin-arm-${side}`}>
          <mesh position={[side * 0.66, 2.72, 0]} scale={[1, 0.86, 0.9]}>
            <sphereGeometry args={[0.2, 28, 28]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[side * 0.82, 2.16, 0.02]} rotation={[0, 0, side * -0.08]}>
            <cylinderGeometry args={[0.105, 0.135, 0.9, 28]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[side * 0.84, 1.65, 0.02]}>
            <sphereGeometry args={[0.095, 20, 20]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[side * 0.86, 1.13, 0.03]} rotation={[0.02, 0, side * -0.04]}>
            <cylinderGeometry args={[0.065, 0.1, 0.85, 24]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[side * 0.86, 0.58, 0.08]} scale={[0.5, 0.8, 0.32]} rotation={[0.08, 0, side * 0.08]}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          {[0, 1, 2, 3].map(f => (
            <mesh key={`skin-finger-${side}-${f}`} position={[side * (0.83 + (f - 1.5) * 0.02), 0.36, 0.09]}>
              <capsuleGeometry args={[0.012, 0.1, 5, 8]} />
              <meshToonMaterial {...skinMat} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Legs and feet */}
      {[-0.24, 0.24].map(x => (
        <group key={`skin-leg-${x}`}>
          <mesh position={[x, -0.16, 0.02]}>
            <cylinderGeometry args={[0.145, 0.215, 1.12, 30]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[x, -0.8, 0.06]}>
            <sphereGeometry args={[0.115, 22, 22]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[x, -1.48, 0.02]}>
            <cylinderGeometry args={[0.075, 0.125, 1.08, 26]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[x, -1.34, -0.08]} scale={[0.85, 1, 0.65]}>
            <sphereGeometry args={[0.1, 18, 18]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[x, -2.1, 0.03]}>
            <sphereGeometry args={[0.066, 14, 14]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
          <mesh position={[x, -2.25, 0.16]} scale={[0.42, 0.18, 0.82]}>
            <sphereGeometry args={[0.22, 22, 22]} />
            <meshToonMaterial {...skinMat} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ── Muscle layer locked to the same body proportions as skin/skeleton ── */
function MuscleLayer({ opacity }: { opacity: number }) {
  const muscleMat = (color: string, op = opacity) => ({
    color,
    gradientMap: toonGradient,
    transparent: true,
    opacity: op,
  });

  return (
    <group>
      {/* neck and shoulder girdle */}
      <mesh position={[0, 2.92, -0.08]} scale={[1.25, 0.38, 0.32]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshToonMaterial {...muscleMat("#FF4D5E", opacity * 0.72)} />
      </mesh>
      {[-0.66, 0.66].map(x => (
        <mesh key={`delt-${x}`} position={[x, 2.68, 0.02]} scale={[0.85, 0.82, 0.72]}>
          <sphereGeometry args={[0.2, 30, 30]} />
          <meshToonMaterial {...muscleMat("#FF6072")} />
        </mesh>
      ))}

      {/* chest, ribs and abdomen */}
      {[-0.24, 0.24].map(x => (
        <mesh key={`pec-${x}`} position={[x, 2.38, 0.34]} scale={[1.22, 0.58, 0.32]} rotation={[0, 0, x > 0 ? -0.08 : 0.08]}>
          <sphereGeometry args={[0.22, 34, 34]} />
          <meshToonMaterial {...muscleMat("#FF6072")} />
        </mesh>
      ))}
      {[2.05, 1.84, 1.63, 1.42].map((y, i) => (
        <group key={`abs-row-${i}`}>
          {[-0.105, 0.105].map(x => (
            <mesh key={`ab-${x}-${y}`} position={[x, y, 0.42]} scale={[0.8, 0.62, 0.22]}>
              <sphereGeometry args={[0.13, 22, 22]} />
              <meshToonMaterial {...muscleMat("#FF3D52", opacity * 0.88)} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.72, 0.45]}>
        <capsuleGeometry args={[0.012, 0.92, 4, 10]} />
        <meshToonMaterial color="#B81F30" transparent opacity={opacity * 0.55} roughness={0.6} />
      </mesh>
      {[-0.38, 0.38].map(x => (
        <mesh key={`oblique-${x}`} position={[x, 1.7, 0.25]} scale={[0.55, 1.15, 0.28]} rotation={[0.05, 0, x > 0 ? -0.22 : 0.22]}>
          <capsuleGeometry args={[0.11, 0.56, 8, 22]} />
          <meshToonMaterial {...muscleMat("#FF4D5E", opacity * 0.62)} />
        </mesh>
      ))}
      {[-0.45, 0.45].map(x => (
        <group key={`serratus-${x}`}>
          {[2.18, 2.03, 1.88].map((y, i) => (
            <mesh key={`ser-${i}`} position={[x, y, 0.25]} rotation={[0, 0, x > 0 ? -0.45 : 0.45]} scale={[1, 0.34, 0.32]}>
              <capsuleGeometry args={[0.028, 0.18, 4, 10]} />
              <meshToonMaterial {...muscleMat("#FF5566", opacity * 0.52)} />
            </mesh>
          ))}
        </group>
      ))}

      {/* arms */}
      {[-1, 1].map(side => (
        <group key={`muscle-arm-${side}`}>
          <mesh position={[side * 0.82, 2.16, 0.09]} rotation={[0, 0, side * -0.08]}>
            <capsuleGeometry args={[0.085, 0.5, 10, 24]} />
            <meshToonMaterial {...muscleMat("#FF6F7E")} />
          </mesh>
          <mesh position={[side * 0.82, 2.15, -0.08]} rotation={[0, 0, side * -0.08]}>
            <capsuleGeometry args={[0.075, 0.48, 8, 22]} />
            <meshToonMaterial {...muscleMat("#E64254", opacity * 0.78)} />
          </mesh>
          <mesh position={[side * 0.87, 1.14, 0.05]} rotation={[0.02, 0, side * -0.04]}>
            <capsuleGeometry args={[0.055, 0.55, 8, 20]} />
            <meshToonMaterial {...muscleMat("#FF5A6A", opacity * 0.72)} />
          </mesh>
        </group>
      ))}

      {/* hips, thighs, calves */}
      {[-0.24, 0.24].map(x => (
        <group key={`leg-muscle-${x}`}>
          <mesh position={[x, -0.16, 0.12]}>
            <capsuleGeometry args={[0.115, 0.78, 10, 26]} />
            <meshToonMaterial {...muscleMat("#FF5566")} />
          </mesh>
          <mesh position={[x + (x > 0 ? 0.065 : -0.065), -0.18, 0.04]}>
            <capsuleGeometry args={[0.078, 0.74, 8, 22]} />
            <meshToonMaterial {...muscleMat("#E64254", opacity * 0.76)} />
          </mesh>
          <mesh position={[x, -0.2, -0.1]}>
            <capsuleGeometry args={[0.1, 0.72, 8, 22]} />
            <meshToonMaterial {...muscleMat("#C72E40", opacity * 0.68)} />
          </mesh>
          <mesh position={[x, -1.36, -0.06]} scale={[0.86, 1, 0.7]}>
            <capsuleGeometry args={[0.082, 0.48, 8, 22]} />
            <meshToonMaterial {...muscleMat("#FF5A6A", opacity * 0.75)} />
          </mesh>
          <mesh position={[x, -1.58, 0.04]}>
            <capsuleGeometry args={[0.045, 0.38, 6, 16]} />
            <meshToonMaterial {...muscleMat("#E64254", opacity * 0.56)} />
          </mesh>
        </group>
      ))}

      {[-0.2, 0.2].map(x => (
        <mesh key={`glute-${x}`} position={[x, 0.35, -0.23]} scale={[1.05, 0.72, 0.62]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshToonMaterial {...muscleMat("#E64254", opacity * 0.62)} />
        </mesh>
      ))}
      {[-0.1, 0.1].map(x => (
        <mesh key={`spine-muscle-${x}`} position={[x, 1.55, -0.24]}>
          <capsuleGeometry args={[0.045, 1.65, 6, 16]} />
          <meshToonMaterial {...muscleMat("#A82230", opacity * 0.42)} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Realistic Skeleton ── */
function SkeletonLayer({ opacity }: { opacity: number }) {
  const boneMat = useMemo(() => ({
    color: "#FFFCEB",
    gradientMap: toonGradient,
    transparent: true,
    opacity,
  }), [opacity]);

  return (
    <group>
      {/* Skull */}
      <mesh position={[0, 3.9, 0]} scale={[0.9, 1, 0.85]}>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshToonMaterial {...boneMat} />
      </mesh>
      {/* Mandible */}
      <mesh position={[0, 3.4, 0.15]} scale={[0.65, 0.3, 0.45]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshToonMaterial {...boneMat} />
      </mesh>
      {/* Eye sockets */}
      {[-0.15, 0.15].map(x => (
        <mesh key={`eye${x}`} position={[x, 3.9, 0.38]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={opacity * 0.9} />
        </mesh>
      ))}
      {/* Nasal cavity */}
      <mesh position={[0, 3.72, 0.42]} scale={[0.5, 0.8, 0.4]}>
        <coneGeometry args={[0.06, 0.12, 8]} />
        <meshToonMaterial {...boneMat} />
      </mesh>
      {/* Teeth row hint */}
      <mesh position={[0, 3.38, 0.28]} scale={[0.7, 0.2, 0.3]}>
        <boxGeometry args={[0.3, 0.04, 0.08]} />
        <meshToonMaterial color="#F5F0E0" roughness={0.1} clearcoat={1} transparent opacity={opacity * 0.7} />
      </mesh>

      {/* Cervical spine (7 vertebrae) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`cerv${i}`} position={[0, 3.2 - i * 0.1, -0.1]}>
          <cylinderGeometry args={[0.06, 0.07, 0.08, 12]} />
          <meshToonMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Thoracic + Lumbar spine (17 vertebrae) */}
      {Array.from({ length: 17 }).map((_, i) => (
        <mesh key={`vert${i}`} position={[0, 2.5 - i * 0.17, -0.15]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.06 + i * 0.002, 0.07 + i * 0.002, 0.12, 12]} />
          <meshToonMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Sacrum */}
      <mesh position={[0, 0.15, -0.18]} scale={[1.2, 1, 0.6]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshToonMaterial {...boneMat} />
      </mesh>

      {/* Rib cage (12 pairs) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={`rib${i}`}>
          {[-1, 1].map(side => {
            const ribLen = i < 7 ? 0.35 - i * 0.01 : 0.28 - (i - 7) * 0.03;
            return (
              <mesh key={`r${side}${i}`} position={[side * 0.2, 2.5 - i * 0.14, 0.1]} rotation={[0.2, 0, side * (0.5 + i * 0.02)]}>
                <torusGeometry args={[ribLen, 0.015, 8, 24, Math.PI * 0.8]} />
                <meshToonMaterial {...boneMat} opacity={opacity * 0.75} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Sternum */}
      <mesh position={[0, 2.2, 0.35]}>
        <boxGeometry args={[0.08, 0.9, 0.03]} />
        <meshToonMaterial {...boneMat} />
      </mesh>

      {/* Clavicles */}
      {[-1, 1].map(side => (
        <mesh key={`clav${side}`} position={[side * 0.35, 2.8, 0.15]} rotation={[0, 0, side * 0.2]}>
          <capsuleGeometry args={[0.02, 0.4, 6, 12]} />
          <meshToonMaterial {...boneMat} />
        </mesh>
      ))}

      {/* Scapulae */}
      {[-0.5, 0.5].map(x => (
        <mesh key={`scap${x}`} position={[x, 2.5, -0.25]} scale={[0.6, 1, 0.15]}>
          <coneGeometry args={[0.2, 0.5, 3]} />
          <meshToonMaterial {...boneMat} opacity={opacity * 0.6} />
        </mesh>
      ))}

      {/* Pelvis */}
      <mesh position={[0, 0.35, 0]} scale={[1.3, 0.5, 0.6]}>
        <torusGeometry args={[0.3, 0.08, 12, 24, Math.PI]} />
        <meshToonMaterial {...boneMat} />
      </mesh>

      {/* Arms */}
      {[-1, 1].map(side => (
        <group key={`armb${side}`}>
          <mesh position={[side * 0.75, 2.25, 0]} rotation={[0, 0, side * -0.06]}>
            <capsuleGeometry args={[0.035, 0.9, 6, 16]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.78, 1.7, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.8, 1.2, 0.03]}>
            <capsuleGeometry args={[0.025, 0.75, 6, 12]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.82, 1.2, -0.03]}>
            <capsuleGeometry args={[0.02, 0.7, 6, 12]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[side * 0.81, 0.72, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          {/* Hand bones (metacarpals) */}
          {[0, 1, 2, 3, 4].map(f => (
            <mesh key={`mc${f}`} position={[side * (0.78 + (f - 2) * 0.015), 0.55, 0.04 + (f - 2) * 0.008]}>
              <capsuleGeometry args={[0.008, 0.12, 4, 6]} />
              <meshToonMaterial {...boneMat} opacity={opacity * 0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Legs */}
      {[-0.22, 0.22].map(x => (
        <group key={`legb${x}`}>
          <mesh position={[x, -0.2, 0]}>
            <capsuleGeometry args={[0.045, 0.9, 6, 16]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -0.8, 0.1]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -1.5, 0.02]}>
            <capsuleGeometry args={[0.035, 0.9, 6, 16]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[x * 1.15, -1.5, -0.02]}>
            <capsuleGeometry args={[0.02, 0.8, 6, 12]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          <mesh position={[x, -2.05, 0.05]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshToonMaterial {...boneMat} />
          </mesh>
          {/* Metatarsals */}
          {[0, 1, 2, 3, 4].map(t => (
            <mesh key={`mt${t}`} position={[x + (t - 2) * 0.015, -2.2, 0.12 + t * 0.02]}>
              <capsuleGeometry args={[0.008, 0.08, 4, 6]} />
              <meshToonMaterial {...boneMat} opacity={opacity * 0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ── Organs ── */
function OrgansLayer({ opacity, selected, onSelect }: { opacity: number; selected: string | null; onSelect: (n: string | null) => void }) {
  return (
    <group>
      {organData.map(organ => (
        <OrganMesh key={organ.name} data={organ} opacity={opacity} isSelected={selected === organ.name} onSelect={onSelect} />
      ))}
      <BloodVessels opacity={opacity} />
      <Trachea opacity={opacity} />
    </group>
  );
}

function OrganMesh({ data, opacity, isSelected, onSelect }: any) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const labelLift = Math.max(...data.size) + 0.18;

  useFrame(() => {
    if (!ref.current) return;
    const t = isSelected ? 1 + Math.sin(Date.now() * 0.004) * 0.04 : hovered ? 1.06 : 1;
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), 0.08);
  });

  return (
    <group position={data.position}>
      <group
        ref={ref}
        onClick={e => { e.stopPropagation(); onSelect(isSelected ? null : data.name); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {data.name === "Brain" ? (
          <group>
            {[-0.11, 0.11].map(x => (
              <mesh key={`brain-${x}`} position={[x, 0, 0]} scale={[0.82, 0.62, 0.72]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : opacity * 0.72} roughness={0.58} clearcoat={0.35} sheen={0.6} sheenColor={data.color} />
              </mesh>
            ))}
            {[-0.18, -0.08, 0.08, 0.18].map((x, i) => (
              <mesh key={`gyrus-${i}`} position={[x, 0.08, 0.14]} rotation={[0.4, 0, 0]}>
                <torusGeometry args={[0.075, 0.012, 8, 18, Math.PI * 1.25]} />
                <meshToonMaterial color="#D9829C" transparent opacity={opacity * 0.65} roughness={0.7} />
              </mesh>
            ))}
          </group>
        ) : data.name.includes("Lung") ? (
          <group>
            <mesh scale={data.size} rotation={[data.name === "Left Lung" ? -0.1 : 0.1, 0, data.name === "Left Lung" ? 0.18 : -0.18]}>
              <sphereGeometry args={[1, 34, 34]} />
              <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : opacity * 0.68} roughness={0.48} clearcoat={0.32} sheen={0.5} sheenColor={data.color} />
            </mesh>
            <mesh position={[data.name === "Left Lung" ? 0.1 : -0.1, 0.1, 0.13]}>
              <capsuleGeometry args={[0.018, 0.48, 5, 12]} />
              <meshToonMaterial color="#B85D75" transparent opacity={opacity * 0.55} />
            </mesh>
          </group>
        ) : data.name === "Heart" ? (
          <group rotation={[0, 0, -0.18]}>
            <mesh position={[-0.05, 0.04, 0]} scale={[0.14, 0.16, 0.12]}>
              <sphereGeometry args={[1, 28, 28]} />
              <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : opacity * 0.8} roughness={0.38} clearcoat={0.45} sheen={0.7} sheenColor="#E65A5A" />
            </mesh>
            <mesh position={[0.06, 0.04, 0]} scale={[0.13, 0.15, 0.12]}>
              <sphereGeometry args={[1, 28, 28]} />
              <meshToonMaterial color="#8F1515" transparent opacity={isSelected ? opacity : opacity * 0.78} roughness={0.38} clearcoat={0.45} />
            </mesh>
            <mesh position={[0, -0.09, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.14, 0.22, 28]} />
              <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : opacity * 0.8} roughness={0.4} clearcoat={0.35} />
            </mesh>
          </group>
        ) : data.name === "Kidneys" ? (
          <group>
            {[-0.18, 0.18].map(x => (
              <mesh key={`kidney-${x}`} position={[x, 0, 0]} scale={[0.11, 0.18, 0.08]} rotation={[0, 0, x > 0 ? -0.32 : 0.32]}>
                <sphereGeometry args={[1, 28, 28]} />
                <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : opacity * 0.72} roughness={0.45} clearcoat={0.3} />
              </mesh>
            ))}
          </group>
        ) : data.name === "Intestines" ? (
          <group>
            {[0, 1, 2, 3].map(i => (
              <mesh key={`intestine-${i}`} position={[0, 0.09 - i * 0.08, 0]} scale={[1.15 - i * 0.1, 0.5, 0.52]}>
                <torusGeometry args={[0.2, 0.035, 10, 28]} />
                <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity * 0.9 : opacity * 0.68} roughness={0.5} clearcoat={0.25} />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh scale={data.size}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshToonMaterial color={data.color} transparent opacity={isSelected ? opacity : hovered ? opacity * 0.85 : opacity * 0.7} roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.15} sheen={0.8} sheenColor={data.color} emissive={isSelected ? data.color : "#000000"} emissiveIntensity={isSelected ? 0.3 : 0} />
          </mesh>
        )}
      </group>
      <Html distanceFactor={10} position={[0, labelLift, 0]} center style={{ pointerEvents: "none" }}>
        <span className={`text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full backdrop-blur-md ${isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-background/60 text-foreground/80"}`}>
          {data.name}
        </span>
      </Html>
      {isSelected && (
        <Html distanceFactor={10} position={[Math.max(...data.size) + 0.42, 0, 0]} style={{ pointerEvents: "none" }}>
          <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl p-3 w-52 shadow-2xl">
            <h4 className="text-xs font-bold" style={{ color: data.color }}>{data.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{data.info}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function BloodVessels({ opacity }: { opacity: number }) {
  const curves = useMemo(() => {
    const aorta = Array.from({ length: 12 }, (_, i) => new THREE.Vector3(
      Math.sin(i * 0.3) * 0.12 + 0.05, 3.6 - i * 0.35, Math.cos(i * 0.4) * 0.08 + 0.15
    ));
    const carotidL = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(-0.12, 3.1 + i * 0.15, 0.08));
    const carotidR = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(0.12, 3.1 + i * 0.15, 0.08));
    const venaC = Array.from({ length: 10 }, (_, i) => new THREE.Vector3(
      -Math.sin(i * 0.25) * 0.1 + 0.15, 3.4 - i * 0.35, Math.cos(i * 0.3) * 0.06 + 0.1
    ));
    return [
      { curve: new THREE.CatmullRomCurve3(aorta), r: 0.022, color: "#D32F2F" },
      { curve: new THREE.CatmullRomCurve3(carotidL), r: 0.012, color: "#E53935" },
      { curve: new THREE.CatmullRomCurve3(carotidR), r: 0.012, color: "#E53935" },
      { curve: new THREE.CatmullRomCurve3(venaC), r: 0.02, color: "#1565C0" },
    ];
  }, []);

  return (
    <group>
      {curves.map((v, i) => (
        <mesh key={i}>
          <tubeGeometry args={[v.curve, 32, v.r, 12, false]} />
          <meshToonMaterial color={v.color} transparent opacity={opacity * 0.55} roughness={0.4} clearcoat={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Trachea({ opacity }: { opacity: number }) {
  const curve = useMemo(() => {
    const pts = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(0, 3.2 - i * 0.15, 0.12));
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  return (
    <mesh>
      <tubeGeometry args={[curve, 16, 0.04, 12, false]} />
      <meshToonMaterial color="#E0C8A8" transparent opacity={opacity * 0.4} roughness={0.5} clearcoat={0.3} />
    </mesh>
  );
}

/* ── Cells ── */
function CellsLayer({ opacity }: { opacity: number }) {
  const cells = useMemo(() => {
    const arr = [];
    const types = [
      { color: "#E53935", name: "Red Blood Cell" },
      { color: "#FFFFFF", name: "White Blood Cell" },
      { color: "#8E24AA", name: "Platelet" },
      { color: "#43A047", name: "Nerve Cell" },
      { color: "#FB8C00", name: "Epithelial" },
    ];
    for (let i = 0; i < 80; i++) {
      const t = types[Math.floor(Math.random() * types.length)];
      arr.push({
        pos: [(Math.random() - 0.5) * 1.4, Math.random() * 5 - 1, (Math.random() - 0.5) * 0.8] as [number, number, number],
        size: 0.02 + Math.random() * 0.04,
        ...t,
        speed: 0.001 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {cells.map((cell, i) => (
        <CellParticle key={i} cell={cell} opacity={opacity} />
      ))}
    </group>
  );
}

function CellParticle({ cell, opacity }: { cell: any; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = cell.pos[1] + Math.sin(t * cell.speed * 100 + cell.phase) * 0.12;
    ref.current.position.x = cell.pos[0] + Math.cos(t * cell.speed * 80 + cell.phase) * 0.04;
  });

  return (
    <mesh ref={ref} position={cell.pos}>
      <sphereGeometry args={[cell.size, 12, 12]} />
      <meshToonMaterial color={cell.color} transparent opacity={opacity * 0.5} roughness={0.2} clearcoat={1} emissive={cell.color} emissiveIntensity={0.15} />
    </mesh>
  );
}

/* ── Main Component ── */
const Anatomy3D = () => {
  const [activeLayers, setActiveLayers] = useState<Set<BodyLayer>>(new Set(["skin"]));
  const [selected, setSelected] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(true);

  const toggleLayer = useCallback((layer: BodyLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }, []);

  const presets = [
    { label: "Full Body", layers: ["skin"] as BodyLayer[] },
    { label: "X-Ray", layers: ["skeleton", "organs"] as BodyLayer[] },
    { label: "Deep View", layers: ["muscles", "skeleton", "organs", "cells"] as BodyLayer[] },
    { label: "All Layers", layers: ["skin", "muscles", "skeleton", "organs", "cells"] as BodyLayer[] },
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <Link to="/3d">
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold">Anatomy Lab</h1>
            <p className="text-[10px] text-muted-foreground">Interactive Human Body Explorer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => setShowPanel(!showPanel)} title={showPanel ? "Hide layers panel" : "Show layers panel"}>
            {showPanel ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span className="hidden sm:inline">{showPanel ? "Hide" : "Layers"}</span>
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5" onClick={() => { setActiveLayers(new Set(["skin"])); setSelected(null); }}>
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 1.25, 5.6], fov: 38 }} shadows dpr={[1, 2]}>
          <ResponsiveCamera baseFov={38} pullBack={0.62} maxFov={58} />
          <color attach="background" args={["#1a1530"]} />
          <fog attach="fog" args={["#1a1530", 14, 28]} />

          {/* Flat anime-style lighting: strong key + soft fill, no harsh speculars */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 8, 5]} intensity={1.1} color="#ffffff" />
          <directionalLight position={[-4, 4, -3]} intensity={0.4} color="#c4d1ff" />
          <directionalLight position={[0, -3, 4]} intensity={0.25} color="#ffc4d6" />
          <hemisphereLight args={["#ffe5f0", "#3d2a5e", 0.6]} />

          {activeLayers.has("skin") && <SkinLayer opacity={activeLayers.size === 1 ? 1 : 0.18} />}
          {activeLayers.has("muscles") && <MuscleLayer opacity={0.75} />}
          {activeLayers.has("skeleton") && <SkeletonLayer opacity={activeLayers.has("muscles") ? 0.55 : 0.9} />}
          {activeLayers.has("organs") && <OrgansLayer opacity={0.85} selected={selected} onSelect={setSelected} />}
          {activeLayers.has("cells") && <CellsLayer opacity={0.8} />}

          <ContactShadows position={[0, -2.4, 0]} opacity={0.5} scale={6} blur={3.2} far={4} color="#000000" />

          <OrbitControls enablePan enableZoom enableRotate minDistance={2.5} maxDistance={10} target={[0, 0.85, 0]} />

        </Canvas>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-4 left-4 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl z-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Body Layers</h3>
              </div>
              <div className="space-y-1.5">
                {layerConfig.map(layer => (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeLayers.has(layer.id)
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <span>{layer.emoji}</span>
                    <span>{layer.label}</span>
                    <div className={`ml-auto w-2.5 h-2.5 rounded-full transition-colors ${activeLayers.has(layer.id) ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground mb-2 font-medium">Quick Presets</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {presets.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { setActiveLayers(new Set(p.layers)); setSelected(null); }}
                      className="px-2 py-1.5 rounded-lg bg-secondary/60 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 w-52 bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-4 hidden sm:block shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold">How to Use</h3>
          </div>
          <ul className="text-[10px] text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-1.5"><span>🖱️</span> Rotate to examine</li>
            <li className="flex items-center gap-1.5"><span>🔍</span> Scroll to zoom</li>
            <li className="flex items-center gap-1.5"><span>🫀</span> Click organs for info</li>
            <li className="flex items-center gap-1.5"><span>🧬</span> Toggle layers to explore</li>
          </ul>
        </motion.div>

        {activeLayers.has("organs") && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-card/90 backdrop-blur-xl border border-border rounded-2xl p-3 shadow-xl">
            <p className="text-[10px] text-muted-foreground font-medium mb-2">Select Organ</p>
            <div className="flex gap-1.5 flex-wrap">
              {organData.map(o => (
                <button
                  key={o.name}
                  onClick={() => setSelected(selected === o.name ? null : o.name)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    selected === o.name
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ backgroundColor: o.color }} />
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <AIExplainPanel
        context={`Active layers: ${Array.from(activeLayers).join(", ")}. ${selected ? `Selected organ: ${selected}` : "No organ selected."}`}
        subject="Human Anatomy"
      />
    </div>
  );
};

export default Anatomy3D;
