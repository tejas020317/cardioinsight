import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function HeartModel({ color }) {
  const meshRef = useRef();
  
  // Procedurally generate a 3D heart since heart.glb is missing
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x + 25, y + 25);
    shape.bezierCurveTo(x + 25, y + 25, x + 20, y, x, y);
    shape.bezierCurveTo(x - 30, y, x - 30, y + 35, x - 30, y + 35);
    shape.bezierCurveTo(x - 30, y + 55, x - 10, y + 77, x + 25, y + 95);
    shape.bezierCurveTo(x + 60, y + 77, x + 80, y + 55, x + 80, y + 35);
    shape.bezierCurveTo(x + 80, y + 35, x + 80, y, x + 50, y);
    shape.bezierCurveTo(x + 35, y, x + 25, y + 25, x + 25, y + 25);

    const extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 2, bevelThickness: 2 };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    geo.scale(0.015, -0.015, 0.015); // Scale and flip Y so the heart is upright
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3,
      roughness: 0.4,
      metalness: 0.1
    });
  }, [color]);

  const targetColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      
      const pulseSpeed = 4;
      const baseScale = 1.4; 
      const pulseScale = baseScale + Math.sin(clock.getElapsedTime() * pulseSpeed) * 0.05;
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      meshRef.current.material.color.lerp(targetColor, 0.05);
      meshRef.current.material.emissive.lerp(targetColor, 0.05);
    }
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

export default function Heart3D({ focusPatient }) {
  // Map risk level to colors based on the design system
  const riskLevel = focusPatient ? focusPatient.risk_level : null;
  let heartColor = "#94a3b8"; // Default/Idle - Neutral Slate
  
  if (riskLevel === "Low Risk") {
    heartColor = "#22c55e"; // Safe - Green
  } else if (riskLevel === "Medium Risk") {
    heartColor = "#f59e0b"; // Warn - Yellow
  } else if (riskLevel === "High Risk") {
    heartColor = "#ef4444"; // Danger - Red
  }

  return (
    <div style={{ 
      width: "100%", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      position: "relative"
    }}>
      {/* Soft Glow Behind Heart */}
      <div style={{
        position: 'absolute',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: heartColor,
        filter: 'blur(40px)',
        opacity: 0.25,
        transform: 'translateY(-10px)'
      }} />

      <Canvas camera={{ position: [0, 0, 5] }} style={{ transform: 'translateY(-10px)' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Suspense fallback={null}>
          <group position={[0, -0.1, 0]}>
            <HeartModel color={heartColor} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}
