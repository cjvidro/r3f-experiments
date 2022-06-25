import React, {Suspense, useEffect, useRef, useState} from "react";
import {Canvas, Color, useFrame, useThree} from "@react-three/fiber";
import {Bounds, OrbitControls, PerspectiveCamera, Points, PositionalAudio, Stats} from "@react-three/drei";
import {AudioAnalyser, BufferGeometry, Camera, TextureLoader, Vector3} from "three";
import Box from "./components/Box";


function Analyzer({ sound }) {
  // <Analyzer /> will not run before everything else in the suspense block is resolved.
  // That means <PositionalAudio/>, which executes async, is ready by the time we're here.
  // The next frame (useEffect) is guaranteed(!) to access positional-audios ref.
  const analyser = useRef();
  const ref = useRef();
  const [time, setTime] = useState(0);
  const [allPoints, setAllPoints] = useState([]);

  useEffect(
    () => void (analyser.current = new AudioAnalyser(sound.current, 128)), // Adjust this int by powers of 2 to increase num of data points
    [sound]
  );
  useFrame(() => {
    setTime(time + 1/10);

    if (analyser.current) {
      const freqData = analyser.current.getFrequencyData();
      const numPoints = freqData.length;
      for (let i = 0; i < numPoints; i++) {
        setAllPoints((oldArray) => [...oldArray, new Vector3((i - (numPoints / 2))/4, freqData[i] / 60, -time)]);
      }

      if (allPoints.length > 90 * numPoints) {
        setAllPoints((oldArray) => oldArray.slice(numPoints, allPoints.length));
      }

      ref.current.geometry = new BufferGeometry().setFromPoints(allPoints);


    }
  });

  return (
    <Points ref={ref} position={[0, 0, time - 8]}>
      <pointsMaterial size={0.2} color={0x0043FF}/>
    </Points>
  );
}

function PlaySound({ url }) {
  // This component creates a suspense block, blocking execution until
  // all async tasks (in this case PositionAudio) have been resolved.
  const sound = useRef();

  return (
    <Suspense fallback={null}>
      <PositionalAudio autoplay url={url} ref={sound} position={[7, 4, 10]}/>
      <Analyzer sound={sound}/>
    </Suspense>
  );
}

export default function App() {
  return (
    <Canvas>
      <color attach="background" args={["black"]}/>
      <PerspectiveCamera makeDefault position={[7, 4, 10]}>

      </PerspectiveCamera>
      <PlaySound url="sounds/teardrop.mp3" />
      <OrbitControls makeDefault/>
      <Stats />
    </Canvas>
  );
}