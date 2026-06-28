import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

float organic(vec2 p, float t) {
  float v = 0.0;
  v += sin(p.x * 2.5 + t * 0.5) * cos(p.y * 2.0 + t * 0.3) * 0.5;
  v += sin(p.x * 4.0 + p.y * 3.0 + t * 0.7) * 0.25;
  v += sin((p.x * 8.0 - p.y * 5.0) + t * 1.1) * 0.125;
  v += sin(p.y * 6.0 + t * 0.4) * 0.0625;
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;

  p.x += uMouse.x * 0.08;
  p.y += uMouse.y * 0.08;

  float v = organic(p, uTime);
  float v2 = organic(p * 1.7 + 1.2, uTime * 0.8);
  float v3 = organic(p * 3.2 + 0.7, uTime * 1.3);

  vec3 gold = vec3(0.831, 0.639, 0.451);
  vec3 amber = vec3(0.729, 0.486, 0.235);
  vec3 cream = vec3(0.980, 0.953, 0.878);
  vec3 rust = vec3(0.627, 0.322, 0.176);

  vec3 color = mix(gold, amber, v * 0.5 + 0.5);
  color = mix(color, cream, v2 * 0.3);
  color = mix(color, rust, v3 * 0.15);

  float vignette = 1.0 - length(uv - 0.5) * 1.5;
  color *= vignette;

  gl_FragColor = vec4(color, 0.08);
}
`

function ShaderPlane() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const { pointer } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  const animationTime = useRef(0)
  const animationFrame = useRef<number>(0)

  useEffect(() => {
    const animate = () => {
      const now = performance.now()
      const delta = now - animationTime.current
      
      if (delta >= 100) { // Update every 100ms instead of every frame
        uniforms.uTime.value = animationTime.current / 1000
        uniforms.uMouse.value.x = pointer.x
        uniforms.uMouse.value.y = pointer.y
        animationTime.current = now
      }
      
      animationFrame.current = requestAnimationFrame(animate)
    }
    
    animationTime.current = performance.now()
    animationFrame.current = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(animationFrame.current)
    }
  }, [pointer.x, pointer.y])

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function OrganicShaderCanvas() {
  return (
    <Canvas
      className="fixed inset-0"
      gl={{ antialias: false, alpha: true }}
      camera={{ position: [0, 0, 1] }}
      style={{ pointerEvents: 'none', zIndex: -1 }}
    >
      <ShaderPlane />
    </Canvas>
  )
}
