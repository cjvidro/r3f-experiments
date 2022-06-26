import {Points, shaderMaterial} from "@react-three/drei";
import {extend, useFrame} from "@react-three/fiber";
import {useRef} from "react";
import React from "react";

export const MyPointsMaterial = shaderMaterial(
  {},
  /* vertex shader glsl */ `
    attribute vec3 color;
    attribute float size;
    varying vec3 vColor;
    varying float vGray;

    void main() {
      // to fragmentShader
      vColor = color;
      vGray = (vColor.x + vColor.y + vColor.z) / 3.0;

      // set vertex position
      
      vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y, position.z, 1.0 );
      //vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y, vGray * 3.0, 1.0 );
      gl_Position = projectionMatrix * mvPosition;

      // set vertex size
      gl_PointSize = size * ( 300.0 / -mvPosition.z );
    }
  `,
  /* fragment shader glsl */ `
    varying vec3 vColor;
    varying float vGray;
    
    void main() {
      float gray = vGray;

     // if (gray < 0.5) {
     //   gray = 0.0;
     // } else {
     //   gray = 1.0;
     // }
    
      gl_FragColor = vec4( vColor, 1 );
      //gl_FragColor = vec4( vGray, vGray, vGray, gray );
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

  ctx.drawImage(image, 0, 0);  return ctx.getImageData(0, 0, w, h);
}

export function PointsCam({video, width, height}) {

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