import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BotHead() {
  const headRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const target = new THREE.Vector3();

  const { scene } = useGLTF("/bothead.gltf.glb");

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  /* ✅ FIX FACING DIRECTION */
  useEffect(() => {
    scene.rotation.y = -Math.PI / 2;
    // ✅ SCALE UP MODEL
    scene.scale.set(1.4, 1.4, 1.4);
  }, [scene]);

  useFrame(({ clock }) => {
    if (!headRef.current) return;

    target.set(mouse.current.x * 2.5, mouse.current.y * 1.0, 3);

    headRef.current.lookAt(target);

    // smooth
    headRef.current.rotation.y *= 0.45;
    headRef.current.rotation.x *= 0.45;

    headRef.current.rotation.y = THREE.MathUtils.clamp(
      headRef.current.rotation.y,
      -0.6,
      0.6
    );

    headRef.current.rotation.x = THREE.MathUtils.clamp(
      headRef.current.rotation.x,
      -0.4,
      0.4
    );

    // idle float
    headRef.current.position.y = Math.sin(clock.getElapsedTime() * 2.0) * 0.03;
  });

  return (
    <group ref={headRef}>
      <primitive object={scene} />
    </group>
  );
}
