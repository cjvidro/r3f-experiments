import './App.css';
import Box from './components/Box';
import {OrbitControls, Stats} from '@react-three/drei';
import {Canvas} from '@react-three/fiber';
import React from "react";
import {PointsCam} from "./components/WebcamEffect";

let video = document.getElementById('video');

const width = 960;
const height = 540;

function App() {

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {video: {width: width, height: height, facingMode: 'user'}};
    navigator.mediaDevices.getUserMedia(constraints).then(
      function (stream) {
        // apply the stream to the video element used in the texture
        video.srcObject = stream;
        video.width = width;
        video.height = height;
        video.play();
      }).catch(
      function (error) {
        console.error('Unable to access the camera/webcam.', error);
      });
  } else {
    console.error('MediaDevices interface not available.');
  }

  return (
    <>
      <Canvas>
        <color attach={"background"} args={["black"]} />
        <ambientLight intensity={1} color="white"/>
        <directionalLight intensity={1} color="white"/>
        <OrbitControls/>
        <Box position={[-1.2, 0, 0]}/>
        <Stats/>
        <PointsCam video={video} width={width} height={height}/>
      </Canvas>
    </>
  );
}

export default App;
