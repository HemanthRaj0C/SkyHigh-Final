'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Mesh, Group, BufferGeometry, LineBasicMaterial, Line } from 'three';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

// Planet data with realistic-inspired but visually compressed scales
const planetsData = [
  {
    name: 'mercury',
    size: 0.38,
    distance: 8,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
    texture: '/textures/mercury.jpg',
    color: '#8C7853',
  },
  {
    name: 'venus',
    size: 0.95,
    distance: 12,
    orbitSpeed: 0.015,
    rotationSpeed: 0.002,
    texture: '/textures/venus.jpg',
    color: '#FFC649',
  },
  {
    name: 'earth',
    size: 1,
    distance: 16,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    texture: '/textures/earth.jpg',
    color: '#4169E1',
  },
  {
    name: 'mars',
    size: 0.53,
    distance: 20,
    orbitSpeed: 0.008,
    rotationSpeed: 0.018,
    texture: '/textures/mars.jpg',
    color: '#CD5C5C',
  },
  {
    name: 'jupiter',
    size: 2.5,
    distance: 32,
    orbitSpeed: 0.002,
    rotationSpeed: 0.04,
    texture: '/textures/jupiter.jpg',
    color: '#DAA520',
  },
  {
    name: 'saturn',
    size: 2.2,
    distance: 42,
    orbitSpeed: 0.0009,
    rotationSpeed: 0.038,
    texture: '/textures/saturn.jpg',
    color: '#F4E7C6',
    hasRings: true,
  },
  {
    name: 'uranus',
    size: 1.6,
    distance: 52,
    orbitSpeed: 0.0004,
    rotationSpeed: 0.03,
    texture: '/textures/uranus.jpg',
    color: '#4FD0E7',
  },
  {
    name: 'neptune',
    size: 1.5,
    distance: 60,
    orbitSpeed: 0.0001,
    rotationSpeed: 0.032,
    texture: '/textures/neptune.jpg',
    color: '#4169E1',
  },
];

// Satellites data
const satellitesData = [
  { name: 'moon', parent: 'earth', size: 0.27, distance: 2.5, orbitSpeed: 0.05, texture: '/textures/moon.jpg' },
  { name: 'iss', parent: 'earth', size: 0.05, distance: 1.3, orbitSpeed: 0.1, color: '#FFFFFF' },
];

// Spacecraft data
const spacecraftData = [
  { name: 'parker', parent: 'sun', size: 0.03, distance: 3, orbitSpeed: 0.15, color: '#FF4500' },
];

// Orbit Path Component
function OrbitPath({ radius, color = '#ffffff' }: { radius: number; color?: string }) {
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color, opacity: 0.15, transparent: true });
  
  return <primitive object={new Line(geometry, material)} />;
}

// Preload all textures at once
function TexturePreloader() {
  useTexture.preload('/textures/sun.jpg');
  useTexture.preload('/textures/mercury.jpg');
  useTexture.preload('/textures/venus.jpg');
  useTexture.preload('/textures/earth.jpg');
  useTexture.preload('/textures/mars.jpg');
  useTexture.preload('/textures/jupiter.jpg');
  useTexture.preload('/textures/saturn.jpg');
  useTexture.preload('/textures/uranus.jpg');
  useTexture.preload('/textures/neptune.jpg');
  useTexture.preload('/textures/moon.jpg');
  useTexture.preload('/textures/saturn-rings.png');
  return null;
}

// Sun Component
function Sun({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<Mesh>(null);
  const sunTexture = useTexture('/textures/sun.jpg');
  const selectedBody = useStore((state) => state.selectedBody);
  const isSelected = selectedBody === 'sun';
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <>
      <mesh 
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FDB813"
          emissiveIntensity={isSelected ? 2.0 : 1.5}
          toneMapped={false}
        />
        <pointLight intensity={2} distance={200} decay={1} />
      </mesh>
      
      {/* Selection highlight for sun */}
      {isSelected && (
        <>
          <mesh scale={1.1}>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.2} />
          </mesh>
          <mesh scale={1.15}>
            <sphereGeometry args={[3, 32, 32]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
          </mesh>
        </>
      )}
    </>
  );
}

// Store planet world positions for camera tracking
const planetPositions = new Map<string, THREE.Vector3>();

// Planet Component
function Planet({ data, onClick }: { data: typeof planetsData[0]; onClick: () => void }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const planetTexture = useTexture(data.texture);
  const ringsTexture = data.hasRings ? useTexture('/textures/saturn-rings.png') : null;
  const { selectedBody, layers } = useStore();
  const timeSpeed = useStore((state) => state.timeSpeed);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += data.orbitSpeed * timeSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed;
      
      // Store the world position for camera tracking
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      planetPositions.set(data.name, worldPos);
    }
  });
  
  const isSelected = selectedBody === data.name;
  
  if (!layers.showPlanets) return null;
  
  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[data.distance, 0, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial map={planetTexture} />
      </mesh>
      
      {/* Selection highlight - animated glow */}
      {isSelected && (
        <>
          <mesh position={[data.distance, 0, 0]} scale={1.15}>
            <sphereGeometry args={[data.size, 32, 32]} />
            <meshBasicMaterial color="#4DA6FF" transparent opacity={0.3} />
          </mesh>
          <mesh position={[data.distance, 0, 0]} scale={1.2}>
            <sphereGeometry args={[data.size, 32, 32]} />
            <meshBasicMaterial color="#4DA6FF" transparent opacity={0.15} />
          </mesh>
          <pointLight 
            position={[data.distance, 0, 0]} 
            intensity={1.5} 
            distance={data.size * 3} 
            color="#4DA6FF" 
          />
        </>
      )}
      
      {/* Saturn Rings */}
      {data.hasRings && ringsTexture && (
        <mesh position={[data.distance, 0, 0]} rotation={[Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[data.size * 1.2, data.size * 2, 64]} />
          <meshBasicMaterial
            map={ringsTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Label */}
      {layers.showLabels && (
        <mesh position={[data.distance, data.size + 0.5, 0]}>
          <sprite>
            <spriteMaterial color="#ffffff" transparent opacity={0.7} />
          </sprite>
        </mesh>
      )}
    </group>
  );
}

// Satellite Component (Moon, ISS, etc.)
function Satellite({ data, parentDistance }: { data: typeof satellitesData[0]; parentDistance: number }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const { layers } = useStore();
  const timeSpeed = useStore((state) => state.timeSpeed);
  
  const texture = data.texture ? useTexture(data.texture) : null;
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += data.orbitSpeed * timeSpeed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  if (!layers.showSatellites) return null;
  
  return (
    <group ref={groupRef} position={[parentDistance, 0, 0]}>
      <mesh ref={meshRef} position={[data.distance, 0, 0]}>
        <sphereGeometry args={[data.size, 16, 16]} />
        {texture ? (
          <meshStandardMaterial map={texture} />
        ) : (
          <meshStandardMaterial color={data.color || '#CCCCCC'} />
        )}
      </mesh>
    </group>
  );
}

// Spacecraft Component (Parker Solar Probe, etc.)
function Spacecraft({ data }: { data: typeof spacecraftData[0] }) {
  const groupRef = useRef<Group>(null);
  const { layers } = useStore();
  const timeSpeed = useStore((state) => state.timeSpeed);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += data.orbitSpeed * timeSpeed;
    }
  });
  
  if (!layers.showSpacecraft) return null;
  
  return (
    <group ref={groupRef}>
      <mesh position={[data.distance, 0, 0]}>
        <boxGeometry args={[data.size, data.size, data.size * 2]} />
        <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Asteroid Belt Component
function AsteroidBelt() {
  const { layers } = useStore();
  
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 300; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 24 + Math.random() * 4; // Between Mars and Jupiter
      const size = 0.02 + Math.random() * 0.05;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const y = (Math.random() - 0.5) * 0.5;
      
      temp.push({ x, y, z, size });
    }
    return temp;
  }, []);
  
  if (!layers.showAsteroids) return null;
  
  return (
    <group>
      {asteroids.map((asteroid, i) => (
        <mesh key={i} position={[asteroid.x, asteroid.y, asteroid.z]}>
          <sphereGeometry args={[asteroid.size, 6, 6]} />
          <meshStandardMaterial color="#8B7355" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Comet Component
function Comets() {
  const { layers } = useStore();
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });
  
  const comets = useMemo(() => {
    return [
      { x: 45, y: 5, z: 10, size: 0.1, tailLength: 2 },
      { x: -35, y: -8, z: -25, size: 0.08, tailLength: 1.5 },
    ];
  }, []);
  
  if (!layers.showComets) return null;
  
  return (
    <group ref={groupRef}>
      {comets.map((comet, i) => (
        <group key={i} position={[comet.x, comet.y, comet.z]}>
          <mesh>
            <sphereGeometry args={[comet.size, 8, 8]} />
            <meshStandardMaterial color="#AACCFF" emissive="#88AAFF" emissiveIntensity={0.5} />
          </mesh>
          {/* Tail */}
          <mesh position={[-comet.tailLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[comet.size * 0.5, comet.tailLength, 8]} />
            <meshBasicMaterial color="#AACCFF" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Camera Controller - Continuously follow selected planet
function CameraController({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { selectedBody } = useStore();
  const lastSelectedRef = useRef<string | null>(null);
  
  useFrame(({ camera }) => {
    // Reset camera to default view when deselected
    if (!selectedBody && lastSelectedRef.current !== null) {
      lastSelectedRef.current = null;
      camera.position.lerp(new THREE.Vector3(0, 50, 80), 0.05);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      controlsRef.current.update();
      return;
    }
    
    if (!selectedBody || !controlsRef.current) return;
    
    lastSelectedRef.current = selectedBody;
    
    let targetX = 0, targetZ = 0, targetY = 0, cameraTargetX, cameraTargetY, cameraTargetZ, offsetDistance;
    
    // Handle Sun selection
    if (selectedBody === 'sun') {
      targetX = 0;
      targetY = 0;
      targetZ = 0;
      offsetDistance = 15;
      cameraTargetX = offsetDistance;
      cameraTargetY = 10;
      cameraTargetZ = offsetDistance;
    } else {
      // Get the actual planet world position from the stored positions
      const planetPos = planetPositions.get(selectedBody);
      if (!planetPos) return; // Planet hasn't rendered yet
      
      targetX = planetPos.x;
      targetY = planetPos.y;
      targetZ = planetPos.z;
      
      // Find planet data for sizing
      const planet = planetsData.find((p) => p.name === selectedBody);
      if (!planet) return;
      
      // Camera offset from planet (behind and above for nice view)
      offsetDistance = Math.max(planet.size * 5, 3);
      
      // Calculate offset direction (away from sun)
      const distanceFromSun = Math.sqrt(targetX * targetX + targetZ * targetZ);
      const dirX = targetX / distanceFromSun;
      const dirZ = targetZ / distanceFromSun;
      
      cameraTargetX = targetX + dirX * offsetDistance;
      cameraTargetY = targetY + Math.max(planet.size * 3, 2);
      cameraTargetZ = targetZ + dirZ * offsetDistance;
    }
    
    // Smooth lerp to follow the planet continuously
    camera.position.lerp(
      new THREE.Vector3(cameraTargetX, cameraTargetY, cameraTargetZ),
      0.05
    );
    
    controlsRef.current.target.lerp(
      new THREE.Vector3(targetX, targetY, targetZ),
      0.05
    );
    
    controlsRef.current.update();
  });
  
  return null;
}

// Main Scene Component
function Scene({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const setSelectedBody = useStore((state) => state.setSelectedBody);
  const toggleInfoPanel = useStore((state) => state.toggleInfoPanel);
  const showInfoPanel = useStore((state) => state.showInfoPanel);
  const { layers } = useStore();
  
  const handlePlanetClick = (planetName: string) => {
    setSelectedBody(planetName as any);
    // Open info panel if not already open
    if (!showInfoPanel) {
      toggleInfoPanel();
    }
  };
  
  return (
    <>
      {/* Camera Controller */}
      <CameraController controlsRef={controlsRef} />
      
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      
      {/* Sun */}
      <Sun onClick={() => handlePlanetClick('sun')} />
      
      {/* Orbit Paths */}
      {layers.showOrbits && (
        <>
          {planetsData.map((planet) => (
            <OrbitPath key={planet.name} radius={planet.distance} color={planet.color} />
          ))}
        </>
      )}
      
      {/* Planets */}
      {planetsData.map((planet) => (
        <Planet
          key={planet.name}
          data={planet}
          onClick={() => handlePlanetClick(planet.name)}
        />
      ))}
      
      {/* Satellites */}
      {satellitesData.map((satellite) => {
        const parent = planetsData.find((p) => p.name === satellite.parent);
        return parent ? (
          <Satellite key={satellite.name} data={satellite} parentDistance={parent.distance} />
        ) : null;
      })}
      
      {/* Spacecraft */}
      {spacecraftData.map((craft) => (
        <Spacecraft key={craft.name} data={craft} />
      ))}
      
      {/* Asteroid Belt */}
      <AsteroidBelt />
      
      {/* Comets */}
      <Comets />
      
      {/* Starfield */}
      <Stars radius={300} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

// Loading fallback
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#444444" />
    </mesh>
  );
}

// Main Canvas Export
export default function SolarSystemScene() {
  const controlsRef = useRef<any>(null);
  
  return (
    <Canvas
      camera={{ position: [0, 50, 80], fov: 60 }}
      gl={{ 
        antialias: true, 
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={<Loader />}>
        <TexturePreloader />
        <Scene controlsRef={controlsRef} />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2 + 0.5}
        minPolarAngle={Math.PI / 2 - 1}
      />
    </Canvas>
  );
}
