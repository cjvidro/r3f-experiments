import './App.css';
import {Center, Cloud, Float, Image, OrthographicCamera, shaderMaterial, Stats, Text, Text3D} from '@react-three/drei';
import {Canvas, extend, useFrame} from '@react-three/fiber';
import glsl from "babel-plugin-glsl/macro"
import React, {useRef, useState} from "react";
import {Color} from "three";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uTime: 0,
    uColor: new Color(0.0, 0.0, 0.0),
  },
  // Vertex shader
  glsl`
      varying vec2 vUv;
      precision mediump float;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  // Fragment shader
  glsl`
    precision mediump float;
  
    uniform vec3 uColor;
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      gl_FragColor = vec4(tan(vUv.x + uTime), cos(vUv.y + uTime), sin(uColor.z + uTime), 1.0);
    }
  `
);

extend({WaveShaderMaterial});

function App() {

  function TextTop() {
    const ref = useRef();

    useFrame(({clock}) => (ref.current.uTime = clock.getElapsedTime()));

    let text = `BEAT BATTLE VOTING
    IS UNDERWAY AT:`;

    return (
      <Text color={"white"}
            font="fonts/graystroke.otf"
            anchorX="center"
            anchorY="middle"
            fontSize={0.5}
            maxWidth={200}
            outlineColor={0x1258b5}
            outlineWidth={"5%"}
            position={[0, 2, 0]}
            text={text}
      >
        <waveShaderMaterial ref={ref} uColor="hotpink"/>
      </Text>
    )
  }

  function BottomText() {
    let text = `          ANYONE CAN VOTE!
   LOGIN WITH DISCORD`;

    const ref = useRef();
    let [time, setTime] = useState(0);

    useFrame((state, delta) => {
      setTime(time + delta);
      ref.current.position.x += Math.cos(time) / 150;
    });

    return (
      <Text color={"white"}
            font="fonts/graystroke.otf"
            anchorX="center"
            anchorY="middle"
            fontSize={0.5}
            maxWidth={200}
            outlineColor={0xff002e0}
            outlineWidth={"5%"}
            ref={ref}
            position={[0, -3, 0]}
            text={text}
      >
      </Text>
    )
  }

  function TextCenterMost() {
    return (
      <Center>
        <Float floatIntensity={0.5} rotationIntensity={0.5} speed={3}>
          <Text3D
            font={"fonts/MusticaPro.json"}
            bevelEnabled
            size={0.5}
          >
            BATTLES.DONTOVERTHINKSHIT.COM
            <meshStandardMaterial receiveShadow color="white"/>
          </Text3D>
        </Float>
      </Center>
    )
  }

  return (
    <>
      <Canvas>
        <color attach="background" args={["black"]}/>
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100}/>
        <ambientLight intensity={0.5}/>
        <directionalLight castShadow position={[-10, 10, 5]} intensity={1}/>
        <pointLight distance={5} intensity={10} color="yellow" position={[-7, 0, 1]}/>
        <pointLight distance={5} intensity={10} color="yellow" position={[7, 0, 1]}/>
        <Image url="img/Starsinthesky.jpg" position={[0, 0, -5]} scale={20} transparent opacity={0.3}/>
        <Image url="img/desert.jpg" position={[0, 0, -4]} scale={20} transparent opacity={0.4}/>
        <Cloud position={[-7, -7, -2]} args={[3, 2]}/>
        <Cloud position={[3, -7, -3]} args={[3, 2]}/>
        <Stats/>
        <TextCenterMost/>
        <TextTop/>
        <BottomText/>
      </Canvas>
    </>
  );
}

export default App;
