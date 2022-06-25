import './App.css';
import Box from './components/Box';
import {Html, OrbitControls, Stats} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import React, {useRef} from "react";

function YTVideo(props) {
  const ref = useRef();

  return (
    <group ref={ref} {...props}>
      <Html transform position={[0, 5, 0]}>
        <iframe
          src={props.link}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          width="420"
          height="315"
        >
        </iframe>
      </Html>
    </group>
  );

}

function App() {
  return (
    <>
    <Canvas>
      <ambientLight intensity={1} color="white"/>
      <directionalLight intensity={1} color="white"/>
      <OrbitControls />
      <Box position={[-8, 0, 0]} />
      <Stats />
      <YTVideo link="https://www.youtube.com/embed/7SsrVGHJvaA" position={[-4, 5, 0]}/>
      <YTVideo link="https://www.youtube.com/embed/XKWcAsT8Sqc" position={[4, 5, 7]} rotation={[0, -1.2, 0]}/>
    </Canvas>
    </>
  );
}

export default App;
