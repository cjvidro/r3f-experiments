import './App.css';
import Box from './components/Box';
import {OrbitControls, Stats} from '@react-three/drei';
import {Canvas} from '@react-three/fiber';
import React from "react";
import Cinematic from "./components/Cinematic";

function App() {

  return (
    <>
      <Cinematic/>
      <Canvas id="canvas" aspect={2.35}>
        <color attach="background" args={["black"]}/>
        <ambientLight/>
        <pointLight position={[10, 10, 10]}/>
        <OrbitControls/>
        <Box position={[-1.2, 0, 0]}/>
        <Box position={[1.2, 0, 0]}/>
        <Stats/>
      </Canvas>
    </>
  );
}

export default App;
