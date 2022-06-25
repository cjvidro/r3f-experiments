import './App.css';
import Box from './components/Box';
import {OrbitControls, Points, shaderMaterial, Stats} from '@react-three/drei';
import {Canvas, extend, useFrame} from '@react-three/fiber';
import React, {useRef} from "react";

let video = document.getElementById('video');

const width = 960;
const height = 540;

// https://www.shadertoy.com/view/XtK3W3

export const MyPointsMaterial = shaderMaterial(
  {},
  /* vertex shader glsl */ `
    attribute vec3 color;
    attribute float size;
    varying vec3 vColor;
    varying float vGray;
    
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec2 mod289(vec2 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec3 permute(vec3 x) {
      return mod289(((x*34.0)+1.0)*x);
    }
    
    float snoise(vec2 v)
      {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
    // First corner
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
    
    // Other corners
      vec2 i1;
      //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
      //i1.y = 1.0 - i1.x;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      // x0 = x0 - 0.0 + 0.0 * C.xx ;
      // x1 = x0 - i1 + 1.0 * C.xx ;
      // x2 = x0 - 1.0 + 2.0 * C.xx ;
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
    
    // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    		+ i.x + vec3(0.0, i1.x, 1.0 ));
    
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
    
    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
    
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
    
    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    
    // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    float rand(vec2 co)
    {
       return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      // to fragmentShader
      vColor = color;
      vGray = (vColor.x + vColor.y + vColor.z) / 3.0;

      // set vertex position
      vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y, vGray * 3.0, 1.0 );
      gl_Position = projectionMatrix * mvPosition;

      // set vertex size
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
    }
  `,
  /* fragment shader glsl */ `
    varying vec3 vColor;
    varying float vGray;
    uniform vec3 iResolution;
    
    void main() {
      vec2 fragCoord = vec2(gl_FragCoord.x, gl_FragCoord.y);
      vec2 uv = fragCoord.xy / iResolution.xy;
    
    
      float gray = vGray;

     // if (gray < 0.5) {
     //   gray = 0.0;
     // } else {
     //   gray = 1.0;
     // }

      gl_FragColor = vec4( vGray, vGray, vGray, gray );
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }
  `
);

extend({MyPointsMaterial});

function getImageData(image) {
  const w = image.width;
  const h = image.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  // Invert image
  ctx.translate(w, h);
  ctx.scale(-1, -1);

  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, w, h);
}

function PointsCam() {

  const ref = useRef();

  const vertexPositions = Array(height * width * 3);

  let count = 0;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      vertexPositions[count++] = j / 80;
      vertexPositions[count++] = i / 80;
      vertexPositions[count++] = 0;
    }
  }

  let n = height * width;
  useFrame(() => {
    if (video.width !== 0) {
      const imageData = getImageData(video);
      const length = ref.current.geometry.attributes.position.count;
      for (let i = 0; i < length; i++) {
        const index = i * 4;
        const r = imageData.data[index] / 255;
        const g = imageData.data[index + 1] / 255;
        const b = imageData.data[index + 2] / 255;

        ref.current.geometry.attributes.color.setX(i, r);
        ref.current.geometry.attributes.color.setY(i, g);
        ref.current.geometry.attributes.color.setZ(i, b);
      }
      ref.current.geometry.attributes.color.needsUpdate = true;
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  const makeBuffer = (...args) => Float32Array.from(...args);
  const [positionFinal] = React.useState(() => new Float32Array(vertexPositions));
  const [color] = React.useState(() => makeBuffer({length: n * 3}, () => Math.random()));
  const [size] = React.useState(() => makeBuffer({length: n}, () => 1 / 80));

  return (
    <Points ref={ref} limit={height * width} positions={positionFinal} colors={color} sizes={size}>
      <myPointsMaterial transparent/>
    </Points>
  );
}

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
        <PointsCam/>
      </Canvas>
    </>
  );
}

export default App;
