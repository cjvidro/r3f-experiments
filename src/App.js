import './App.css';
import {Cloud, OrbitControls, Stats} from '@react-three/drei';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import React, {Suspense, useRef} from "react";
import {BufferAttribute, TextureLoader} from "three";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

function IndividualRain({texture, count, width, height}) {
  const pointsRef = useRef();
  const ref = useRef();

  let generateVal = () => {return Math.random()*width - width/2;};

  // Generate all the points
  const p = new Array(count * 3).fill(0);
  const velocities = new Array(count*3).fill(0);

  for (let i = 0; i < count * 3; i += 3) {
    p[i]   = generateVal();
    p[i+1] = Math.random() * height;
    p[i+2] = generateVal();

    velocities[i] = Math.random() * (Math.random()*2 - 1) / 150;
    velocities[i+1] = (Math.random() + 0.6) / 20;
    velocities[i+2] = Math.random() * (Math.random()*2 - 1) / 150;
  }
  const points = new BufferAttribute(new Float32Array(p), 3);

  useFrame(() => {
    for (let i = 0 ; i < count*3; i += 3) {
      let oldLocation = pointsRef.current.array[i+1];
      if (oldLocation < 0) {
        pointsRef.current.array[i] = generateVal();
        pointsRef.current.array[i+1] = height;
        pointsRef.current.array[i+2] = generateVal();
      }
      pointsRef.current.array[i] += velocities[i];
      pointsRef.current.array[i+1] -= velocities[i+1];
      pointsRef.current.array[i+2] += velocities[i+2];
    }
    pointsRef.current.needsUpdate = true;
  });

  return (
    <points ref={ref} position={[-2, -8, -25]}>
      <bufferGeometry>
        <bufferAttribute ref={pointsRef} attach={"attributes-position"} {...points} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        threshold={0.1}
        transparent={true}
        sizeAttenuation={true}
        map={texture}
        depthWrite={false} // fixes having a black box (sometimes) where there should  be transparency...
      />
    </points>
  )
}

function Rain({count, width, height}) {
  const drops = useLoader(TextureLoader, [
    'drop1.png',
    'drop2.png',
    'drop3.png',
    'drop4.png',
    'drop5.png',
  ]);

  return (
    <>
      {drops.map((v) => {return <IndividualRain key={v.uuid} count={count/5} texture={v} width={width} height={height}/>})}
    </>
  );
}

function Model() {
  const gltf = useLoader(OBJLoader, 'HopkinsPark3_1mil_raw_meter_edited.obj');

  return (
    <Suspense fallback={null}>
      <primitive object={gltf} rotation={[-0.4, 0.35, 0.1]}/>
    </Suspense>
  )
}

function Clouds() {
  let parms=[];

  for (let i = 0; i < 20; i++) {
    let p = [];
    p.push(Math.random() * 35 - 10);
    p.push(Math.random() * 35);
    parms.push(p);
  }

  return (
    <>
      {parms.map((p)=>{
        return (
          <Cloud
            key={Math.random()*(p[1]+13337)}
            opacity={0.5}
            transparent
            speed={0.4} // Rotation speed
            width={5} // Width of the full cloud
            depth={1.5} // Z-dir depth
            segments={20} // Number of particles
            position={[p[0], 15 + Math.random()*3-1.5, -p[1]-10]}
          />
        )})}
    </>
  );
}

function App() {

  return (
    <>
    <Canvas>
      <color attach={"background"} args={["black"]}/>
      <ambientLight />
      <directionalLight position={[10, 0, 10]}/>
      <OrbitControls />
      <Clouds/>
      <Rain count={100000} width={30} height={10}/>
      <Model/>
      <Stats />
    </Canvas>
    </>
  );
}

export default App;
