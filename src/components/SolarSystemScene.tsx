'use client';

import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Mesh, Group, BufferGeometry, LineBasicMaterial, Line } from 'three';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

// Calculate real-time astronomical position based on current date
function calculateRealTimeAngle(orbitalPeriodDays: number) {
  const now = new Date();
  const julianDate = (now.getTime() / 86400000) + 2440587.5;
  const daysSinceEpoch = julianDate - 2451545; // J2000.0 epoch
  return ((daysSinceEpoch / orbitalPeriodDays) * 2 * Math.PI) % (2 * Math.PI);
}

// Planet data with realistic-inspired but visually compressed scales
// Famous asteroids data
const asteroidsData = [
  {
    name: 'ceres',
    size: 0.47, // Largest asteroid, dwarf planet
    distance: 26.5, // Between Mars and Jupiter
    orbitSpeed: 0.005,
    rotationSpeed: 0.015,
    color: '#8B7D6B',
    eccentricity: 0.076,
    inclination: 10.6,
    orbitalPeriodDays: 1680,
  },
  {
    name: 'vesta',
    size: 0.26, // Second largest asteroid
    distance: 23.5,
    orbitSpeed: 0.006,
    rotationSpeed: 0.020,
    color: '#A89F91',
    eccentricity: 0.089,
    inclination: 7.1,
    orbitalPeriodDays: 1325,
  },
  {
    name: 'pallas',
    size: 0.26, // Third largest
    distance: 25.8,
    orbitSpeed: 0.0055,
    rotationSpeed: 0.018,
    color: '#9C8E80',
    eccentricity: 0.231,
    inclination: 34.8, // Highly inclined orbit
    orbitalPeriodDays: 1686,
  },
  {
    name: 'hygiea',
    size: 0.22, // Fourth largest
    distance: 27.2,
    orbitSpeed: 0.0048,
    rotationSpeed: 0.016,
    color: '#7A6F63',
    eccentricity: 0.117,
    inclination: 3.8,
    orbitalPeriodDays: 2029,
  },
];

// Satellites data
const satellitesData = [
  {
    name: 'iss',
    displayName: 'ISS',
    parentPlanet: 'earth',
    size: 0.05,
    distance: 1.3, // Relative to Earth
    orbitSpeed: 0.15,
    color: '#C0C0C0',
    orbitalPeriodMinutes: 92.68,
  },
  {
    name: 'hubble',
    displayName: 'Hubble',
    parentPlanet: 'earth',
    size: 0.025,
    distance: 1.35,
    orbitSpeed: 0.14,
    color: '#B0B0B0',
    orbitalPeriodMinutes: 95,
  },
];

const planetsData = [
  {
    name: 'mercury',
    size: 0.38,
    distance: 8,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
    texture: '/textures/mercury.jpg',
    color: '#8C7853',
    initialAngle: 0,
    eccentricity: 0.206, // Mercury has high eccentricity
    inclination: 7.0, // degrees
    orbitalPeriodDays: 88, // Real orbital period
    rotationPeriodHours: 1407.6, // 58.6 Earth days
  },
  {
    name: 'venus',
    size: 0.95,
    distance: 12,
    orbitSpeed: 0.015,
    rotationSpeed: 0.002,
    texture: '/textures/venus.jpg',
    color: '#FFC649',
    initialAngle: 0,
    eccentricity: 0.007, // Venus has nearly circular orbit
    inclination: 3.4,
    orbitalPeriodDays: 225,
    rotationPeriodHours: 5832.5, // 243 Earth days (retrograde)
  },
  {
    name: 'earth',
    size: 1,
    distance: 16,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    texture: '/textures/earth.jpg',
    color: '#4169E1',
    initialAngle: 0,
    eccentricity: 0.017,
    inclination: 0.0, // Reference plane
    orbitalPeriodDays: 365,
    rotationPeriodHours: 23.93, // 24 hours
  },
  {
    name: 'mars',
    size: 0.53,
    distance: 20,
    orbitSpeed: 0.008,
    rotationSpeed: 0.018,
    texture: '/textures/mars.jpg',
    color: '#CD5C5C',
    initialAngle: 0,
    eccentricity: 0.093, // Mars has noticeable eccentricity
    inclination: 1.9,
    orbitalPeriodDays: 687,
    rotationPeriodHours: 24.62, // Similar to Earth
  },
  {
    name: 'jupiter',
    size: 2.5,
    distance: 32,
    orbitSpeed: 0.002,
    rotationSpeed: 0.04,
    texture: '/textures/jupiter.jpg',
    color: '#DAA520',
    initialAngle: 0,
    eccentricity: 0.048,
    inclination: 1.3,
    orbitalPeriodDays: 4333,
    rotationPeriodHours: 9.93, // Very fast rotation
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
    initialAngle: 0,
    eccentricity: 0.056,
    inclination: 2.5,
    orbitalPeriodDays: 10759,
    rotationPeriodHours: 10.66, // Fast rotation
  },
  {
    name: 'uranus',
    size: 1.6,
    distance: 52,
    orbitSpeed: 0.0004,
    rotationSpeed: 0.03,
    texture: '/textures/uranus.jpg',
    color: '#4FD0E7',
    initialAngle: 0,
    eccentricity: 0.047,
    inclination: 0.8,
    orbitalPeriodDays: 30687,
    rotationPeriodHours: 17.24, // Retrograde rotation
  },
  {
    name: 'neptune',
    size: 1.5,
    distance: 60,
    orbitSpeed: 0.0001,
    rotationSpeed: 0.032,
    texture: '/textures/neptune.jpg',
    color: '#4169E1',
    initialAngle: 0,
    eccentricity: 0.009,
    inclination: 1.8,
    orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.11, // Fast rotation
  },
];

// Orbit Path Component - Now with elliptical orbits, inclination, and click support
function OrbitPath({ 
  radius, 
  color = '#ffffff', 
  eccentricity = 0,
  inclination = 0,
  planetName,
  onClick 
}: { 
  radius: number; 
  color?: string; 
  eccentricity?: number;
  inclination?: number;
  planetName: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const points = useMemo(() => {
    const pts = [];
    const segments = 256; // More segments for smoother ellipses
    
    // Calculate semi-major and semi-minor axes for ellipse
    const a = radius; // semi-major axis
    const b = radius * Math.sqrt(1 - eccentricity * eccentricity); // semi-minor axis
    const c = radius * eccentricity; // focal point offset
    const inclinationRad = (inclination * Math.PI) / 180; // Convert to radians
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // Ellipse formula with sun at one focus
      const x = (a * Math.cos(angle)) - c;
      const z = b * Math.sin(angle);
      // Apply orbital inclination (tilt)
      const y = z * Math.sin(inclinationRad);
      const zTilted = z * Math.cos(inclinationRad);
      pts.push(new THREE.Vector3(x, y, zTilted));
    }
    return pts;
  }, [radius, eccentricity, inclination]);
  
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  
  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
        setHovered(false);
      }}
    >
      <tubeGeometry args={[curve, 256, 0.05, 8, false]} />
      <meshBasicMaterial 
        color={color} 
        opacity={hovered ? 0.6 : 0.3} 
        transparent 
      />
    </mesh>
  );
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
  useTexture.preload('/textures/saturn-ring-alpha.png');
  return null;
}

// Asteroid Belt Component - creates thousands of small asteroids
function AsteroidBelt() {
  const asteroidCount = 2000;
  const timeSpeed = useStore((state) => state.timeSpeed);
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < asteroidCount; i++) {
      const distance = 22 + Math.random() * 8; // Between Mars (20) and Jupiter (32)
      const angle = Math.random() * Math.PI * 2;
      const size = 0.02 + Math.random() * 0.08; // Small random sizes
      const speed = 0.003 + Math.random() * 0.004;
      const verticalOffset = (Math.random() - 0.5) * 2; // Vertical spread
      // Approximate orbital period (in days) based on distance using Kepler's 3rd law
      const orbitalPeriodDays = Math.pow(distance / 16, 1.5) * 365; // Relative to Earth
      temp.push({ distance, angle, size, speed, verticalOffset, orbitalPeriodDays });
    }
    return temp;
  }, []);

  useFrame(() => {
    asteroids.forEach((asteroid) => {
      if (timeSpeed === -1) {
        // Real-time position
        asteroid.angle = calculateRealTimeAngle(asteroid.orbitalPeriodDays);
      } else {
        // Animated position
        asteroid.angle += asteroid.speed * 0.01 * timeSpeed;
      }
    });
  });

  const { layers } = useStore();
  if (!layers.showAsteroids) return null;

  return (
    <>
      {asteroids.map((asteroid, i) => (
        <mesh
          key={i}
          position={[
            asteroid.distance * Math.cos(asteroid.angle),
            asteroid.verticalOffset,
            asteroid.distance * Math.sin(asteroid.angle),
          ]}
        >
          <sphereGeometry args={[asteroid.size, 6, 6]} />
          <meshStandardMaterial color="#8B8B7A" roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

// Asteroid Component - for named asteroids
function Asteroid({ data, onClick }: { data: typeof asteroidsData[0]; onClick: () => void }) {
  const meshRef = useRef<Mesh>(null);
  const { selectedBody, layers } = useStore();
  const timeSpeed = useStore((state) => state.timeSpeed);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const lastTimeSpeedRef = useRef(timeSpeed);

  const a = data.distance;
  const b = data.distance * Math.sqrt(1 - data.eccentricity * data.eccentricity);
  const c = data.distance * data.eccentricity;
  const inclinationRad = (data.inclination * Math.PI) / 180;

  useFrame(() => {
    if (meshRef.current) {
      let angle: number;
      
      // Check if switching to real-time mode
      if (timeSpeed === -1 && lastTimeSpeedRef.current !== -1) {
        // Initialize to real-time position
        angleRef.current = calculateRealTimeAngle(data.orbitalPeriodDays);
      }
      
      if (timeSpeed === -1) {
        // Real-time astronomical position
        angle = calculateRealTimeAngle(data.orbitalPeriodDays);
      } else {
        // Animated position
        angleRef.current += data.orbitSpeed * timeSpeed;
        angle = angleRef.current;
      }
      
      lastTimeSpeedRef.current = timeSpeed;

      const x = (a * Math.cos(angle)) - c;
      const z = b * Math.sin(angle);
      const y = z * Math.sin(inclinationRad);
      const zTilted = z * Math.cos(inclinationRad);

      meshRef.current.position.set(x, y, zTilted);
      
      // Real-time rotation
      if (timeSpeed === -1 && data.rotationSpeed) {
        const now = new Date();
        const rotationPeriodHours = (data.orbitalPeriodDays * 24) / 100; // Approximate
        const millisInHour = 3600000;
        const rotationsCompleted = (now.getTime() % (rotationPeriodHours * millisInHour)) / (rotationPeriodHours * millisInHour);
        meshRef.current.rotation.y = rotationsCompleted * Math.PI * 2;
      } else {
        meshRef.current.rotation.y += data.rotationSpeed * (timeSpeed === -1 ? 0 : timeSpeed);
      }

      // Store position for camera tracking
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      planetPositions.set(data.name, worldPos);
    }
  });

  const isSelected = selectedBody === data.name;
  if (!layers.showAsteroids) return null;

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[data.size, 16, 16]} />
      <meshStandardMaterial 
        color={data.color} 
        roughness={0.9}
        emissive={isSelected ? data.color : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
}

// Moon Component
function Moon({ parentPlanet }: { parentPlanet: string }) {
  const meshRef = useRef<Mesh>(null);
  const moonTexture = useTexture('/textures/moon.jpg');
  const { layers } = useStore();
  const angleRef = useRef(0);
  const timeSpeed = useStore((state) => state.timeSpeed);
  const lastTimeSpeedRef = useRef(timeSpeed);
  const orbitalPeriodDays = 27.3; // Moon's orbital period
  const rotationPeriodHours = 27.3 * 24; // Tidally locked

  useFrame(() => {
    if (meshRef.current) {
      const parentPos = planetPositions.get(parentPlanet);
      if (parentPos) {
        let angle: number;
        
        // Check if switching to real-time mode
        if (timeSpeed === -1 && lastTimeSpeedRef.current !== -1) {
          angleRef.current = calculateRealTimeAngle(orbitalPeriodDays);
        }
        
        if (timeSpeed === -1) {
          // Real-time position
          angle = calculateRealTimeAngle(orbitalPeriodDays);
        } else {
          // Animated position
          angleRef.current += 0.02 * timeSpeed;
          angle = angleRef.current;
        }
        
        lastTimeSpeedRef.current = timeSpeed;
        
        const distance = 2; // Distance from Earth
        const x = parentPos.x + distance * Math.cos(angle);
        const z = parentPos.z + distance * Math.sin(angle);
        const y = parentPos.y + 0.2 * Math.sin(angle);
        meshRef.current.position.set(x, y, z);
        
        // Real-time rotation (tidally locked, same as orbit)
        if (timeSpeed === -1) {
          const now = new Date();
          const millisInHour = 3600000;
          const rotationsCompleted = (now.getTime() % (rotationPeriodHours * millisInHour)) / (rotationPeriodHours * millisInHour);
          meshRef.current.rotation.y = rotationsCompleted * Math.PI * 2;
        } else {
          meshRef.current.rotation.y += 0.01 * (timeSpeed === -1 ? 0 : timeSpeed);
        }
        
        // Store position for camera tracking
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        planetPositions.set('moon', worldPos);
      }
    }
  });

  if (!layers.showSatellites) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.27, 16, 16]} />
      <meshStandardMaterial map={moonTexture} />
    </mesh>
  );
}

// Satellite Component (artificial satellites)
function Satellite({ data }: { data: typeof satellitesData[0] }) {
  const meshRef = useRef<Mesh>(null);
  const { layers } = useStore();
  const angleRef = useRef(Math.random() * Math.PI * 2);
  const timeSpeed = useStore((state) => state.timeSpeed);
  const lastTimeSpeedRef = useRef(timeSpeed);
  const orbitalPeriodDays = data.orbitalPeriodMinutes / (24 * 60); // Convert to days

  useFrame(() => {
    if (meshRef.current) {
      const parentPos = planetPositions.get(data.parentPlanet);
      if (parentPos) {
        let angle: number;
        
        // Check if switching to real-time mode
        if (timeSpeed === -1 && lastTimeSpeedRef.current !== -1) {
          angleRef.current = calculateRealTimeAngle(orbitalPeriodDays);
        }
        
        if (timeSpeed === -1) {
          // Real-time position for satellites
          angle = calculateRealTimeAngle(orbitalPeriodDays);
        } else {
          // Animated position
          angleRef.current += data.orbitSpeed * timeSpeed;
          angle = angleRef.current;
        }
        
        lastTimeSpeedRef.current = timeSpeed;
        
        const x = parentPos.x + data.distance * Math.cos(angle);
        const z = parentPos.z + data.distance * Math.sin(angle);
        const y = parentPos.y + 0.1 * Math.sin(angle * 2);
        meshRef.current.position.set(x, y, z);
      }
    }
  });

  if (!layers.showSatellites) return null;

  return (
    <group ref={meshRef}>
      {/* Satellite body */}
      <mesh>
        <boxGeometry args={[data.size, data.size * 0.6, data.size * 0.8]} />
        <meshStandardMaterial color={data.color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Solar panels */}
      <mesh position={[-data.size, 0, 0]}>
        <boxGeometry args={[data.size * 1.5, data.size * 0.05, data.size * 0.9]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[data.size, 0, 0]}>
        <boxGeometry args={[data.size * 1.5, data.size * 0.05, data.size * 0.9]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
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
      
      {/* Selection highlight removed for cleaner look */}
    </>
  );
}

// Store planet world positions for camera tracking
const planetPositions = new Map<string, THREE.Vector3>();

// Planet Component
function Planet({ data, onClick }: { data: typeof planetsData[0]; onClick: () => void }) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const ringMeshRef = useRef<Mesh>(null);
  const planetTexture = useTexture(data.texture);
  const ringsTexture = data.hasRings ? useTexture('/textures/saturn-rings.png') : null;
  const ringsAlphaTexture = data.hasRings ? useTexture('/textures/saturn-ring-alpha.png') : null;
  const { selectedBody, layers } = useStore();
  const timeSpeed = useStore((state) => state.timeSpeed);
  const angleRef = useRef(data.initialAngle || 0);
  const lastTimeSpeedRef = useRef(timeSpeed);
  
  // Calculate elliptical orbit parameters
  const a = data.distance; // semi-major axis
  const b = data.distance * Math.sqrt(1 - (data.eccentricity || 0) * (data.eccentricity || 0)); // semi-minor axis
  const c = data.distance * (data.eccentricity || 0); // focal point offset
  const inclinationRad = ((data.inclination || 0) * Math.PI) / 180; // Convert to radians
  
  useFrame(() => {
    let angle: number;
    
    // Check if switching to real-time mode
    if (timeSpeed === -1 && lastTimeSpeedRef.current !== -1) {
      // Initialize to real-time position
      angleRef.current = calculateRealTimeAngle(data.orbitalPeriodDays || 365);
    }
    
    if (timeSpeed === -1) {
      // Real-time astronomical position
      angle = calculateRealTimeAngle(data.orbitalPeriodDays || 365);
    } else {
      // Animated position
      angleRef.current += data.orbitSpeed * timeSpeed;
      angle = angleRef.current;
    }
    
    lastTimeSpeedRef.current = timeSpeed;
    
    // Calculate elliptical position with sun at one focus
    const x = (a * Math.cos(angle)) - c;
    const z = b * Math.sin(angle);
    // Apply orbital inclination (tilt)
    const y = z * Math.sin(inclinationRad);
    const zTilted = z * Math.cos(inclinationRad);
    
    if (meshRef.current) {
      meshRef.current.position.set(x, y, zTilted);
      
      // Update planet rotation (spin on its axis)
      if (timeSpeed === -1 && data.rotationPeriodHours) {
        // Real-time rotation based on actual rotation period
        const now = new Date();
        const millisInHour = 3600000;
        const rotationsCompleted = (now.getTime() % (data.rotationPeriodHours * millisInHour)) / (data.rotationPeriodHours * millisInHour);
        meshRef.current.rotation.y = rotationsCompleted * Math.PI * 2;
      } else {
        // Animated rotation
        meshRef.current.rotation.y += data.rotationSpeed * (timeSpeed === -1 ? 0 : timeSpeed);
      }
      
      // Update ring position if planet has rings (no rotation - rings stay fixed)
      if (data.hasRings && ringMeshRef.current) {
        ringMeshRef.current.position.set(x, y, zTilted);
      }
      
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
        <meshStandardMaterial 
          map={planetTexture}
        />
      </mesh>
      
      {/* Selection highlight removed for cleaner look */}
      
      {/* Saturn Rings */}
      {data.hasRings && ringsTexture && ringsAlphaTexture && (
        <mesh 
          ref={ringMeshRef}
          rotation={[Math.PI / 2 + 0.467, 0, 0]}
        >
          <ringGeometry args={[data.size * 1.4, data.size * 2.5, 64]} />
          <meshStandardMaterial
            map={ringsTexture}
            alphaMap={ringsAlphaTexture}
            side={THREE.DoubleSide}
            transparent={true}
            opacity={1.0}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Labels removed for cleaner appearance */}
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
      // Get the actual world position from the stored positions (planets or asteroids)
      const bodyPos = planetPositions.get(selectedBody);
      if (!bodyPos) return; // Body hasn't rendered yet
      
      targetX = bodyPos.x;
      targetY = bodyPos.y;
      targetZ = bodyPos.z;
      
      // Find data for sizing - check planets first, then asteroids
      const planet = planetsData.find((p) => p.name === selectedBody);
      const asteroid = asteroidsData.find((a) => a.name === selectedBody);
      const bodyData = planet || asteroid;
      
      if (!bodyData) return;
      
      // Camera offset from body (behind and above for nice view)
      offsetDistance = Math.max(bodyData.size * 5, 3);
      
      // Calculate offset direction (away from sun)
      const distanceFromSun = Math.sqrt(targetX * targetX + targetZ * targetZ);
      const dirX = targetX / distanceFromSun;
      const dirZ = targetZ / distanceFromSun;
      
      cameraTargetX = targetX + dirX * offsetDistance;
      cameraTargetY = targetY + Math.max(bodyData.size * 3, 2);
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
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#ffffff', '#080820', 0.6]} />
      <pointLight position={[0, 0, 0]} intensity={3} distance={300} decay={2} />
      
      {/* Sun */}
      <Sun onClick={() => handlePlanetClick('sun')} />
      
      {/* Orbit Paths */}
      {layers.showOrbits && (
        <>
          {planetsData.map((planet) => (
            <OrbitPath 
              key={planet.name} 
              radius={planet.distance} 
              color={planet.color}
              eccentricity={planet.eccentricity || 0}
              inclination={planet.inclination || 0}
              planetName={planet.name}
              onClick={() => handlePlanetClick(planet.name)}
            />
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

      {/* Asteroid Belt */}
      <AsteroidBelt />

      {/* Famous Asteroids */}
      {asteroidsData.map((asteroid) => (
        <Asteroid
          key={asteroid.name}
          data={asteroid}
          onClick={() => handlePlanetClick(asteroid.name)}
        />
      ))}

      {/* Asteroid Orbit Paths */}
      {layers.showOrbits && layers.showAsteroids && (
        <>
          {asteroidsData.map((asteroid) => (
            <OrbitPath
              key={asteroid.name}
              radius={asteroid.distance}
              color={asteroid.color}
              eccentricity={asteroid.eccentricity || 0}
              inclination={asteroid.inclination || 0}
              planetName={asteroid.name}
              onClick={() => handlePlanetClick(asteroid.name)}
            />
          ))}
        </>
      )}

      {/* Moon */}
      <Moon parentPlanet="earth" />

      {/* Satellites */}
      {satellitesData.map((satellite) => (
        <Satellite key={satellite.name} data={satellite} />
      ))}
      
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
