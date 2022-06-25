import './App.css';
import {Line, OrbitControls, Stats} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import React, {useRef, useState} from "react";
import {Vector3} from "three";

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
  let r, g, b;

  if(s === 0){
    r = g = b = l; // achromatic
  }else{
    let hue2rgb = function hue2rgb(p, q, t){
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r,g,b];
}

function CircleSegment({resolution=50, scale=1}) {
  const ref = useRef();
  const [rotationVelocity] = useState(Math.random() / 8);

  const portion = (Math.random()*80+5)/100; // value between 0.05 and 0.85 --- portion of circle to draw
  const maxVal = portion*2*Math.PI; // Largest value of circle needed to generate
  const step  = maxVal / resolution; // Step size of each point

  let partitions = []; // Values to feed into sin and cos functions
  for (let i = 0; i < resolution; i++) {
   partitions.push(i*step);
  }

  const points = partitions.map((p) => {return (new Vector3(Math.sin(p), Math.cos(p), 0))});
  const colors = [];

  for (let i = 0; i < resolution; i++) {
    let h = i/resolution;
    let s = 1;
    let l = 0.5;
    colors.push(hslToRgb(h, s, l));
  }

  useFrame(() => {
    ref.current.rotation.z += rotationVelocity;
  });

  return (
    <Line ref={ref} points={points} scale={scale} lineWidth={2.4} color vertexColors={colors} />
  );
}

function CircleSegments({numSegments = 10, resolution}) {

  let indices = [];
  for (let i = 0; i < numSegments; i++) {
    indices.push(i*0.1 + 0.1)
  }

  return (
    indices.map((v) => {return <CircleSegment resolution={resolution} scale={v} key={v}/>})
  )
}

function App() {

  return (
    <>
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Stats />
      <CircleSegments numSegments={8}/>
    </Canvas>
    </>
  );
}

export default App;
