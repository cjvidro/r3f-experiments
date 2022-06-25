import './App.css';
import {MeshReflectorMaterial, OrbitControls, Plane, Stats} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';
import React, {useRef} from "react";
import {MathUtils, Shape, Vector2, Vector3} from "three";

// https://www.baeldung.com/cs/sort-points-clockwise
function calculateCWPolygonPoints(numPoints, length, width) {
  const randomPoints = Array.from(
    {length: numPoints},
    () => new Vector2(
      MathUtils.randFloat(MathUtils.randFloat(-length, -length/1.2), MathUtils.randFloat(length/1.2, length)),
      MathUtils.randFloat(MathUtils.randFloat(-width, -width/1.2), MathUtils.randFloat(width/1.2, width))
    )
  );
  const ptCenter = new Vector2();

  function getAngle(point) {
    const x = point.x ;
    const y = point.y;
    let angle = Math.atan2(y, x);
    if (angle <= 0) {
      angle = Math.PI*2 + angle;
    }
    return angle;
  }

  function getDistance(point) {
    const x = -point.x;
    const y = -point.y;
    return Math.sqrt(x*x + y*y);
  }

  randomPoints.forEach((p) => {
    ptCenter.x += p.x;
    ptCenter.y += p.y;
  });

  ptCenter.x /= numPoints;
  ptCenter.y /= numPoints;

  randomPoints.forEach((p) => {
    p.x -= ptCenter.x;
    p.y -= ptCenter.y;
  });

  randomPoints.sort((a, b) => {
    const angle1 = getAngle(a);
    const angle2 = getAngle(b);

    if (angle1 < angle2) return 1;

    const d1 = getDistance(a);
    const d2 = getDistance(b);
    if (angle1 === angle2 && d1 < d2) {
      return 1;
    }
    return -1;
  });

  randomPoints.forEach((p) => {
    p.x = p.x + ptCenter.x;
    p.y = p.y + ptCenter.y;
  });

  return randomPoints;
}


function PolyShape({numPoints = 10, length = 4, width = 4, depth=0.5, position=new Vector3(0, 0, 0)}) {
  const points = calculateCWPolygonPoints(numPoints, length, width);
  const ref = useRef();

  const shape = new Shape();
  shape.moveTo(points[0].x, points[0].y);
  points.forEach((val) => shape.lineTo(val.x, val.y));
  shape.lineTo(points[0].x, points[0].y);

  const extrudeSettings = {
    steps: 2,
    depth: depth,
    bevelEnabled: false,
  };

  return (
    <mesh ref={ref} rotation={[Math.PI/2,Math.PI,0]} position={position}>
      <extrudeGeometry args={[shape, extrudeSettings]} />
      <meshStandardMaterial color="gray"/>
    </mesh>
  );
}

function Light() {
  const ref = useRef();

  useFrame(({clock}) => {
    ref.current.position.x = Math.sin(clock.elapsedTime)*6;
    ref.current.position.z = Math.cos(clock.elapsedTime)*6;
  });

  return (
    <directionalLight ref={ref} position={[6, 6, 10]} />
  )
}

function App() {
  const numPolygons = 20;
  const spread = numPolygons*2;

  return (
    <>
    <Canvas>
      <ambientLight intensity={0.1}/>
      <fog attach="fog" args={['#FFFFFF', 10, 80]} />
      <Light/>
      <Plane args={[spread*1.2, spread*1.2]} rotation={[-Math.PI/2, 0, 0]}>
        <MeshReflectorMaterial color="#52514e"/>
      </Plane>
      <OrbitControls />
      {[...Array(numPolygons)].map((e, i) => <PolyShape
        key={MathUtils.generateUUID()}
        depth={MathUtils.randFloat(0.05, 1)}
        position={new Vector3(
          MathUtils.randFloatSpread(spread),
          MathUtils.randFloatSpread(0),
          MathUtils.randFloatSpread(spread)
        )}
        length={MathUtils.randFloat(2, 5)}
        width={MathUtils.randFloat(2, 5)}
        numPoints={MathUtils.randFloat(4, 10)}
      />)}
      <Stats />
    </Canvas>
    </>
  );
}

export default App;
