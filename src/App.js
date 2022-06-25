import './App.css';
import {OrbitControls, OrthographicCamera, Stats} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import React, {useLayoutEffect, useRef, useState} from "react";
import {Color, Matrix4, Object3D, Vector3, VertexColors} from "three";
import Cinematic from "./components/Cinematic";

const size = 25;
const length = size * size;
const o = new Object3D();
const c = new Color();
const niceColor = ["#43435d", "#755ff7", "#dd56a7"];
const colors = Array.from({length}, () => niceColor[Math.floor(Math.random() * 3)]);

function Boxes() {
  const ref = useRef();

  let boxList = Array.from(Array(size), () => new Array(size));
  let numElementsToDisplay = 0;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const shouldDisplay = Math.round(Math.random() * 1.2);
      numElementsToDisplay += shouldDisplay;
      boxList[x][y] = shouldDisplay;
    }
  }

  // remove standalone boxes
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      if (boxList[x][y]) {
        let isNotIsolated = false;

        // check left
        if (x > 0) {
          isNotIsolated = isNotIsolated || boxList[x - 1][y];
        }

        // check up
        if (y < size - 1) {
          isNotIsolated = isNotIsolated || boxList[x][y + 1];
        }

        // check right
        if (x < size - 1) {
          isNotIsolated = isNotIsolated || boxList[x + 1][y];
        }

        // check down
        if (y > 0) {
          isNotIsolated = isNotIsolated || boxList[x][y - 1];
        }

        if (!isNotIsolated) {
          numElementsToDisplay--;
          boxList[x][y] = isNotIsolated;
        }
      }
    }
  }

  const [colorArray] = useState(() => Float32Array.from(Array.from({length: numElementsToDisplay}, (_, i) => c.set(colors[i]).convertSRGBToLinear().toArray()).flat()));

  useLayoutEffect(() => {
    let i = 0;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        if (boxList[x][z]) {
          const id = i++;
          const scaleAmount = 20;
          o.scale.set(0.9, 0.2, 0.9);
          o.position.set(size / 2 - x, 0, size / 2 - z);

          const shouldScale = Math.round(Math.random() / 1.85);
          if (shouldScale) {
            o.scale.set(0.9, scaleAmount, 0.9);
            o.position.set(size / 2 - x, -scaleAmount / 2 + 0.1, size / 2 - z);
          }

          o.updateMatrix();
          ref.current.setMatrixAt(id, o.matrix)
        }
      }
    }

    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  let moveState = Array.from({length: numElementsToDisplay}, () => 0);
  useFrame(() => {
    for (let i = 0; i < numElementsToDisplay; i++) {

      // Random chance to start "movement"
      if (moveState[i] === 0) {
        const shouldMove = Math.round(Math.random() / 1.999);
        moveState[i] = shouldMove ? Math.PI / 100 : 0;
      }

      // Control movement
      if (moveState[i] !== 0) {
        const timeline = Math.sin(moveState[i]) / 2;

        let matrix = new Matrix4();
        ref.current.getMatrixAt(i, matrix);
        let oldScale = new Vector3().setFromMatrixScale(matrix);
        let oldPosition = new Vector3().setFromMatrixPosition(matrix);

        let newScale = new Vector3(oldScale.x, oldScale.y, oldScale.z);
        let newPosition = new Vector3(oldPosition.x, timeline, oldPosition.z);

        // Reset to base if animation is "done"
        if (moveState[i] >= Math.PI) {
          moveState[i] = 0;
          newPosition.y = 0;
        } else {
          moveState[i] += Math.PI / 100;
        }

        o.scale.set(newScale.x, newScale.y, newScale.z);
        o.position.set(newPosition.x, -newScale.y / 2 + 0.1 + newPosition.y, newPosition.z);
        o.updateMatrix();
        ref.current.setMatrixAt(i, o.matrix);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, numElementsToDisplay]}>
      <boxBufferGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]}/>
      </boxBufferGeometry>
      <meshLambertMaterial vertexColors={VertexColors} toneMapped={false}/>
    </instancedMesh>
  )
}

function App() {
  return (
    <>
      <Cinematic/>
      <Canvas>
        <OrthographicCamera
          makeDefault
          zoom={5}
          position={[-5, 8, -5]}
          left={-size}
          right={size}
          top={size}
          bottom={-size}
          near={-2000}
          far={2000}
        />
        <color attach="background" args={["#121316"]}/>
        <fog attach="fog" args={["#121316", 5, 20]}/>
        <hemisphereLight position={[0, 1, 0]} color="#d3d3d3" intensity={1}/>
        <directionalLight position={[0, 10, 0]} color="#FFFFFF" intensity={2}/>
        <directionalLight position={[2, 2, 2]} color="#d3d3d3" intensity={5}/>
        <OrbitControls makeDefault enablePan={false}/>
        <Boxes/>
        <Stats/>
      </Canvas>
    </>
  );
}

export default App;
