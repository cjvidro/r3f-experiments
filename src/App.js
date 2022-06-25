import './App.css';
import {OrbitControls, Stats} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import React, {useRef, useState} from "react";
import {BufferGeometry, Float32BufferAttribute, Vector3} from "three";

function App() {

  function Ring(props) {
    const ref = useRef();
    const time = useRef(0);
    const vertices = [];
    const divisions = 50;
    const [position] = useState(new Vector3(0, 0, props.pos));
    const [rotSpeed] = useState(() => Math.random());

    for (let i = 0; i <= divisions; i++) {
      const v = (i / divisions) * (Math.PI * 2);
      const x = Math.sin(v);
      const y = Math.cos(v);
      vertices.push(x, y, 0);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(vertices, 3)
    );

    useFrame((state, delta) => {
      time.current += delta * 1.5;

      let newZ = position.z + time.current;
      if (newZ > 4) {
        newZ = -27;
        position.z = -27;
        time.current = 0;
      }

      ref.current.position.set(position.x, position.y, newZ);
      ref.current.rotation.z += delta * rotSpeed;
    });

    return (
      <line
        ref={ref}
        onUpdate={(line) => line.computeLineDistances()}
        geometry={geometry}
        scale={[2, 2, 2]}
        position={position}

      >
        <lineDashedMaterial color="blue" dashSize={0.1} gapSize={0.1} />
      </line>
    );
  }

  function Rings() {
    const [arr] = useState(() => {
      return Array.from(Array(10).keys()).map((i) => i * -3);
    });

    return (
      <>
        {arr.map((i) => <Ring key={i} pos={i}/>)}
      </>
    );
  }

  function Effects() {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer>
    );
  }

  return (
    <>
      <Canvas>
        <color attach="background" args={["black"]} />
        <ambientLight/>
        <pointLight position={[10, 10, 10]}/>
        <OrbitControls/>
        <Rings/>
        <Stats/>
        <Effects/>
      </Canvas>
    </>
  );
}

export default App;
