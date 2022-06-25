import './App.css';
import {Box, OrbitControls, SpotLight, Stats} from '@react-three/drei';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import React, {Suspense, useLayoutEffect, useRef} from "react";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {AxesHelper} from "three/src/helpers/AxesHelper";
import {Vector3} from "three";
import SpotLightModel from "./components/Spotlight";
import Pedestal from "./components/Pedestal";


/* https://codesandbox.io/s/volumetric-spotlight-tx1pq?file=/src/App.js:1136-1213 */
function MovingSpot({ vec = new Vector3(), ...props }) {
  const light = useRef();

  useLayoutEffect(() => {

    light.current.target.position.y=Math.tan(Math.PI / 4) * Math.abs(props.position[0]);
    light.current.target.updateWorldMatrix();
  });

  return <SpotLight
    castShadow
    ref={light}
    penumbra={1}
    distance={15}
    angle={0.6}
    attenuation={5}
    anglePower={3}
    intensity={3}
    color={props.color}
    position={[0, 0.7, 0]}
  />
}


function FloorSpotlight(props) {
  return (
    <group rotation={props.rotation} position={props.position}>
      <Suspense fallback={null}>
        <MovingSpot color={props.color} position={props.position} />
        <SpotLightModel/>
      </Suspense>
    </group>
  )
}

FloorSpotlight.defaultProps = {
  position: [0,0,0],
  color: "#FFFFFF"
};

function Nut(props) {
  const gltf = useLoader(GLTFLoader, '/nut.gltf');
  const ref = useRef();

  useFrame(({clock}) => {
    const posRangeFactor = 3.5;
    const posSpeed = 1.3;

    ref.current.position.y = props.position[1] + Math.sin(clock.elapsedTime*posSpeed)/posRangeFactor + (1/posRangeFactor);
    ref.current.rotation.y += 0.008;
  });

  return (
    <Suspense fallback={null}>
      <primitive ref={ref} object={gltf.scene} {...props} />
    </Suspense>
  )
}

Nut.defaultProps = {
  position: [0,0,0]
};

function App() {

  return (
    <>
    <Canvas shadows>
      <color attach="background" args={["black"]}/>
      <ambientLight color="white" intensity={0.2}/>
      <directionalLight position={[0, 25, 0]} color="yellow" intensity={0.8}/>
      {/*<primitive object={new AxesHelper(10)} />*/}
      <OrbitControls autoRotate/>
      <Nut position={[0, 3, 0]}/>
      <FloorSpotlight position={[5, 0, 0]} color="#0c8cbf" />
      <FloorSpotlight position={[-5, 0, 0]} color="orange" rotation={[0, Math.PI, 0]} />
      <Pedestal scale={0.4}/>
      <Stats />
    </Canvas>
    </>
  );
}

export default App;
