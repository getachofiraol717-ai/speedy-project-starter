import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";

/**
 * Auto-fits the default perspective camera to the viewport so 3D scenes
 * are never cut off on phones. Widens FOV and pulls the camera back along
 * its current view direction when the canvas is in portrait orientation.
 *
 * Drop inside any <Canvas>: <ResponsiveCamera baseFov={50} pullBack={1.6} />
 */
interface Props {
  /** Base FOV used in landscape (matches the Canvas camera prop). */
  baseFov?: number;
  /** Multiplier applied to the camera distance in portrait mode. */
  pullBack?: number;
  /** Max FOV cap so the scene doesn't fisheye too hard. */
  maxFov?: number;
}

const ResponsiveCamera = ({ baseFov = 50, pullBack = 1.6, maxFov = 75 }: Props) => {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const aspect = size.width / Math.max(size.height, 1);
    const portrait = aspect < 1;

    // Remember the original position once so we can scale relative to it.
    const orig = (camera as any).__origPos ?? camera.position.clone();
    (camera as any).__origPos = orig;
    const origFov = (camera as any).__origFov ?? baseFov;
    (camera as any).__origFov = origFov;

    if (portrait) {
      // Widen FOV inversely to aspect, capped.
      const fov = Math.min(maxFov, origFov / Math.max(aspect, 0.45));
      camera.fov = fov;
      const factor = pullBack / Math.max(aspect, 0.5);
      camera.position.set(orig.x * factor, orig.y * factor, orig.z * factor);
    } else {
      camera.fov = origFov;
      camera.position.copy(orig);
    }
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, baseFov, pullBack, maxFov]);

  return null;
};

export default ResponsiveCamera;
