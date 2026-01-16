import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import BotHead from "./BotHead.jsx";

export default function BotCanvas() {
  return (
    <div className="bot-container">
      <Canvas
        camera={{ position: [0, 0, 1.8], fov: 35 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 3]} intensity={1} />

        <Suspense fallback={null}>
          <BotHead />
        </Suspense>
      </Canvas>
    </div>
  );
}
