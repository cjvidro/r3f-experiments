import './App.css';
import {OrbitControls, PerspectiveCamera, Stats} from '@react-three/drei';
import {Canvas, useThree} from '@react-three/fiber';
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {BoxGeometry, Color, Object3D, Vector3, VertexColors} from "three";
import Cinematic from "./components/Cinematic";
import {lerp} from "three/src/math/MathUtils";
import {Bloom, EffectComposer, Vignette} from "@react-three/postprocessing";

const o = new Object3D();
const c = new Color();

function Boxes({size = 100, slopeMin = 30, slopeMax=36}) {
  const ref = useRef();
  const length = size * size;
  const niceColor = ["#FF0202", "#FF7B02", "#FFFC02", "#00FF28", "#02FFE1", "#000AFF", "#CC00FF", "#FF0063"];
  const colors = Array.from({length}, () => niceColor[Math.floor(Math.random() * 8)]);

  let boxList = Array.from(Array(size), () => new Array(size));
  let numElementsToDisplay = 0;

  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      let shouldDisplay = Math.round(Math.random() * 3);
      if (y < 40) {
        shouldDisplay = Math.round(Math.random() * y/size * 2.6);
      } else if (y > size - 40) {
        shouldDisplay = Math.round(Math.random() * (size-y)/size * 2.63);
      }
      numElementsToDisplay += shouldDisplay;
      boxList[x][y] = {shouldDisplay: shouldDisplay};
    }
  }

  const [colorArray] = useState(() => Float32Array.from(Array.from({length: numElementsToDisplay}, (_, i) => c.set(colors[i]).convertSRGBToLinear().toArray()).flat()));

  useLayoutEffect(() => {
    let i = 0;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {

        let prevMaxX = 0;
        let prevMaxY = 0;
        let prevRot = 0;
        let curSize = new Vector3(0.9, 0.001, 0.9);

        // Set the previous row's max sizes;
        if (x !== 0) {
          prevMaxX = Math.min(boxList[x-1][z].boundingBox.max.x, boxList[x-1][z].boundingBox.min.x);
          prevMaxY = boxList[x-1][z].boundingBox.max.y;
          prevRot = boxList[x-1][z].rotation;
        }

        // set the rotation
        let rot = prevRot;
        if (slopeMin <= x && x <= slopeMax) {
          rot = lerp(0, -Math.PI/2, (x-slopeMin)/(slopeMax-slopeMin));
        }

        // Set the scale, rotation, and position so that we can compute the new height and depth of the current box
        o.scale.set(0.9, 0.001, 0.9);
        o.rotation.set(0, 0, rot);
        o.position.set(0, 0, 0);
        o.updateMatrix();

        let b = new BoxGeometry(1, 1, 1);
        b.applyMatrix4(o.matrix);
        b.computeBoundingBox();
        b.boundingBox.getSize(curSize);

        // Set the position of the box according to the center
        if (rot === 0) {
          o.position.set(prevMaxX - curSize.x/2 -0.1, prevMaxY - curSize.y/2, size/2.0 - z);
        } else if (rot -0.01 < -Math.PI/2) {
          o.position.set(prevMaxX + curSize.x/2, prevMaxY + curSize.y/2 + 0.1, size/2.0 - z);
        } else {
          o.position.set(prevMaxX - curSize.x/2, prevMaxY + curSize.y/2, size/2.0 - z);
        }
        o.updateMatrix();

        // Display the box if it should be displayed
        if (boxList[x][z].shouldDisplay) {
          const id = i++;

          ref.current.setMatrixAt(id, o.matrix);
        }

        // Store the updated bounding box once it is in position
        b = new BoxGeometry(1, 1, 1);
        b.applyMatrix4(o.matrix);
        b.computeBoundingBox();
        boxList[x][z].boundingBox = b.boundingBox;
        boxList[x][z].rotation = rot;
      }
    }

    ref.current.instanceMatrix.needsUpdate = true;
  }, );

  return (
    <instancedMesh ref={ref} args={[null, null, numElementsToDisplay]}>
      <boxBufferGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]}/>
      </boxBufferGeometry>
      <meshLambertMaterial vertexColors={VertexColors} toneMapped={false}/>
    </instancedMesh>
  )
}

function CameraPositioning() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(-30, 4, 0);
  }, [camera]);

  return null;
}

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Vignette eskil={false} offset={0.05} darkness={1.1} />
      <Bloom intensity={0.3} />
    </EffectComposer>
  )
}

function App() {
  return (
    <>
      <Cinematic/>
      <Canvas >
        <color attach="background" args={["#121316"]}/>
        {/*<hemisphereLight position={[0, 1, 0]} color="#d3d3d3" intensity={1}/>*/}
        <directionalLight position={[0.4, 1, 0]} color="#FFFFFF" intensity={0.5}/>
        <directionalLight position={[1, 0, 0]} color="#d3d3d3" intensity={2}/>
        <PerspectiveCamera position={[0, 3, 0]} makeDefault />
        {/*<OrbitControls makeDefault/>*/}
        <Boxes/>
        <CameraPositioning/>
        <Effects/>
        <Stats/>
      </Canvas>
    </>
  );
}

export default App;
