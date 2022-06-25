import './App.css';
import { OrbitControls, Stats } from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo, useRef} from "react";
import {Color, Matrix4, Object3D, Vector3} from "three";

const SCALE = 1;
const length = (50/SCALE)*(50/SCALE);
const o = new Object3D();

function Boxes() {
  const ref = useRef();
  const randomValues = useMemo(() => Array.from({length: length}, () => Math.max(0.1, Math.pow(Math.random()*Math.random()*1.8, 3))), []);

  useLayoutEffect(() => {
    let i = 0;

    // NOTE TO SELF --> Lowering the total number of iterations progressively distorts the image.
    for (let x = 0; x <= 50; x+=SCALE)
      for (let y = 0; y <= 50; y+=SCALE) {
        const id = i++;

        // Need distance from center / max distance ==>  sqrt(x^2 + y^2) / sqrt(2*25^2)
        const distFromCenter = Math.sqrt(Math.pow(x-25, 2) + Math.pow(y-25, 2));
        const maxDist = Math.sqrt(2*Math.pow(25, 2));
        let hue = distFromCenter / maxDist * 2;
        if (hue > 1) {hue -= 1}

        const color = new Color().setHSL(hue, 1, 0.5);
        ref.current.setColorAt(id, color);
      }
  });

  let time = 0;
  useFrame(({clock}) => {
    time += clock.elapsedTime/100;

    let i = 0;
    for (let x = 0; x <= 50; x+=SCALE)
      for (let y = 0; y <= 50; y+=SCALE) {
        const id = i++;
        const matrix = new Matrix4();
        ref.current.getMatrixAt(id, matrix);
        const oldScale = new Vector3().setFromMatrixScale(matrix).y;
        let scale = Math.min(randomValues[x*y],randomValues[x*y]*Math.abs(randomValues[x*y]*Math.sin(time/3)));

        o.scale.set(1, scale, 1);
        o.position.set(50*SCALE - x, scale/2, 50*SCALE - y);
        o.updateMatrix();
        ref.current.setMatrixAt(id, o.matrix);
      }
    ref.current.instanceMatrix.needsUpdate = true
  });

  return (
    <instancedMesh castShadow receiveShadow ref={ref} args={[null, null, length]}>
      <boxBufferGeometry args={[SCALE, SCALE, SCALE]} />
      <meshStandardMaterial/>
    </instancedMesh>
  )
}

function App() {

  return (
    <>
    <Canvas shadows camera={{position: [0, 20, 0]}}>
      <color attach={"background"} args={['black']}/>
      <ambientLight intensity={0.3}/>
      <directionalLight castShadow position={[150, 100, 150]} intensity={0.5} />
      <Boxes />
      <OrbitControls autoRotate target={[25, 0, 25]}/>
      <Stats/>
    </Canvas>
    </>
  );
}

export default App;
