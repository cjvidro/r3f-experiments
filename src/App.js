import './App.css';
import {OrbitControls, Plane, softShadows, Stats} from '@react-three/drei';
import {Canvas} from '@react-three/fiber';
import React, {Suspense} from "react";
import {useControls} from 'leva';
import {
  CatmullRomCurve3,
  ExtrudeGeometry, MeshStandardMaterial,
  Shape,
  Vector2,
  Vector3
} from "three";
import {seededRandom} from "three/src/math/MathUtils";
import { EffectComposer, DepthOfField, Bloom, } from '@react-three/postprocessing'


function Ribbon() {
  const {hh, numPoints, steps, seed, spread, numLines} = useControls({
    hh: {
      value: 0.01,
      min: 0.001,
      max: 0.05,
      step: 0.001
    },
    numPoints: {
      value: 20,
      min: 2,
      max: 40,
      step: 1
    },
    steps: {
      value: 1000,
      min: 2,
      max: 3000,
      step: 10
    },
    seed: {
      value: 1,
      min: 1,
      max: 10000,
      step: 1
    },
    spread: {
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.01
    },
    numLines: {
      value: 5,
      min: 1,
      max: 20,
      step: 1
    }
  });

  let points = [];
  seededRandom(seed);

  let randPoint = () => {
    return (seededRandom() - 0.5) * 7;
  };

  for (let i = 0; i < numPoints; i++) {
    points.push(new Vector3(randPoint(), randPoint(), randPoint()));
  }

  const curve = new CatmullRomCurve3([...points], true);
  const hw = 0.001;

  const profile = new Shape([
    new Vector2(-hw, -hh),
    new Vector2(-hw,  hh),
    new Vector2( hw,  hh),
    new Vector2( hw, -hh),
    new Vector2(-hw, -hh)
  ]);

  const ribbonGeometry = new ExtrudeGeometry(profile, {
    steps: steps,
    extrudePath: curve
  });

  const ribbonMaterial = new MeshStandardMaterial({color: "white"});

  let meshes = Array.from(Array(numLines).keys()).map(x => (Math.round((x * spread - ((numLines - 1) * spread / 2)) * 100) / 100));

  return (
      <>
        {meshes.map(i => {
          return <mesh castShadow receiveShadow key={i} args={[ribbonGeometry, ribbonMaterial]} position={[i, 0, 0]}/>
        })}
      </>
  );
}

function Effects() {
  const {dof, bloom} = useControls({
    dof: false,
    bloom: true
  });

  return (
    <EffectComposer>
      {dof && <DepthOfField focusDistance={0.8} focalLength={0.3} bokehScale={0.5} height={480} />}
      {bloom && <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} opacity={0.3}/>}
    </EffectComposer>
  )
}

function App() {
  return (
    <Suspense fallback={null}>
    <Canvas shadows colorManagement camera={{position:[-5,2,10], fov:60}}>
      <color attach="background" args={["black"]} />
      <ambientLight intensity={0.2}/>
      <directionalLight
        castShadow
        position={[-5,5,0]}
        intensity={2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left = {-10}
        shadow-camera-right = {10}
        shadow-camera-top = {10}
        shadow-camera-bottom = {-10}
      />
      <group>
        <Ribbon />
      </group>
      <OrbitControls autoRotate dampen/>
      <Stats />
      <Effects />
    </Canvas>
    </Suspense>
  );
}

export default App;
