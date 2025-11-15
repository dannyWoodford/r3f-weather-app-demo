import { useFrame, useThree } from "@react-three/fiber";
import * as React from "react";
import * as THREE from "three";

import CSM from "three-custom-shader-material";


import { getWeatherDescription } from '../../../lib/weatherCodes'
import useWeatherStore from '../../../store/GlobalState'

interface DropsProps {
	count?: number;
	rainProgressRef: React.MutableRefObject<number>;
}

export const Drops = React.forwardRef<THREE.InstancedMesh, DropsProps>(
	({ count = 10000, rainProgressRef }, ref) => {
		const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)
		const weatherCode = useWeatherStore((s) => s.data?.now.weatherCode ?? null)

		// Compute display condition early so effects can depend on it
		const desc = getWeatherDescription(weatherCode)
		const cloudTextVisible = useWeatherStore((s) => s.cloudTextVisible)
		const cameraDoneVersion = useWeatherStore((s) => s.cameraDoneVersion)

		const baseShouldShow = hasEnteredApp && cameraDoneVersion && desc !== 'Unknown'

		const shouldShow = baseShouldShow


		const dropsRef = React.useRef<THREE.InstancedMesh>(null!);
		const _dummy = React.useMemo(() => new THREE.Object3D(), []);
		const initialY = React.useMemo(() => new Float32Array(count).fill(0), []);

		React.useEffect(() => {
			if (!shouldShow) return
			if (!dropsGroupRef.current || !locationVector) return

			const dropsMesh = dropsRef.current;
			for (let i = 0; i < count; i++) {
				_dummy.position.set(
					THREE.MathUtils.randFloatSpread(5),
					THREE.MathUtils.randFloat(-0.1, 5),
					THREE.MathUtils.randFloatSpread(5)
				);

				_dummy.updateMatrix();
				dropsMesh.setMatrixAt(i, _dummy.matrix);
			}
			dropsMesh.instanceMatrix.needsUpdate = true;
			// dropsMesh.geometry.computeVertexNormals();
			// console.log('dropsMesh', dropsMesh)
		}, []);

		useFrame(({ camera }, dt) => {
			if (!shouldShow) return
			if (!dropsGroupRef.current || !locationVector) return

			const dropsMesh = dropsRef.current;

			for (let i = 0; i < count; i++) {
				dropsMesh.getMatrixAt(i, _dummy.matrix);
				_dummy.matrix.decompose(
					_dummy.position,
					_dummy.quaternion,
					_dummy.scale
				);

				_dummy.position.y -= dt * 2.5;
				if (_dummy.position.y <= 0) {
					// _dummy.position.copy(camera.position);
					// _dummy.position.x += THREE.MathUtils.randFloatSpread(5);
					// _dummy.position.y += THREE.MathUtils.randFloat(-0.1, 5);
					// _dummy.position.z += THREE.MathUtils.randFloatSpread(5);
					_dummy.position.set(
						THREE.MathUtils.randFloatSpread(1),
						THREE.MathUtils.randFloat(-0.1, 2),
						THREE.MathUtils.randFloatSpread(1)
					);
					initialY[i] = _dummy.position.y;
					_dummy.scale.setScalar(THREE.MathUtils.randFloat(0.1, 0.5));
					// _dummy.scale.setScalar(THREE.MathUtils.randFloat(1, 5));
				}

				_dummy.rotation.y = Math.atan2(
					camera.position.x - _dummy.position.x,
					camera.position.z - _dummy.position.z
				);

				_dummy.updateMatrix();
				dropsMesh.setMatrixAt(i, _dummy.matrix);
			}
			dropsMesh.instanceMatrix.needsUpdate = true;
			// dropsMesh.geometry.computeVertexNormals();
		});

		const vertexShader = React.useMemo(
			() => /* glsl */ `
				uniform float uTime;

        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
				vPosition = position;
				vUv = uv;
        }
      `,
			[]
		);

		const fragmentShader = React.useMemo(
			() => /* glsl */ `
        uniform float uRainProgress;

        varying vec3 vPosition;
        varying vec2 vUv;

        float sdUnevenCapsule( vec2 p, float r1, float r2, float h ) {
          p.x = abs(p.x);
          float b = (r1-r2)/h;
          float a = sqrt(1.0-b*b);
          float k = dot(p,vec2(-b,a));
          if( k < 0.0 ) return length(p) - r1;
          if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
          return dot(p, vec2(a,b) ) - r1;
        }

        void main() {
					vec2 coord = vUv - 0.5;
          coord *= 10.0;
          float dropletDistance = sdUnevenCapsule(coord, 0.05, 0.0, 2.0);
          dropletDistance = 1.0 - smoothstep(0.0, 0.05, dropletDistance);

          float rainProgress = smoothstep(0.0, 0.5, uRainProgress);
          rainProgress = clamp(rainProgress, 0.0, 1.0);
          // csm_DiffuseColor.a = dropletDistance * 0.1 * rainProgress;
          csm_DiffuseColor.a = dropletDistance * 0.1;
          // csm_DiffuseColor.a = 0.2;
        }
      `,
			[]
		);

		const uniforms = React.useMemo(
			() => ({
				uRainProgress: { value: 0 },
			}),
			[]
		);

		useFrame(({ gl }) => {
			if (!shouldShow) return
			if (!dropsGroupRef.current || !locationVector) return

			gl.setRenderTarget;
			uniforms.uRainProgress.value = rainProgressRef.current;
		});

		const locationVector = useWeatherStore((s) => s.locationVector)
		const dropsGroupRef = React.useRef<THREE.Group>(null)
		const camera = useThree(({ camera }) => camera)

		React.useEffect(() => {
			if (!shouldShow) return
			if (!dropsGroupRef.current || !locationVector) return
			if (locationVector.lengthSq() === 0) return

			// Outward unit normal from Earth's center through the location
			const up = locationVector.clone().normalize()

			// set Text x units above the surface at that location
			const elevated = locationVector.clone().addScaledVector(up, 100)

			dropsGroupRef.current.position.copy(elevated)
		}, [camera, locationVector, shouldShow])

		useFrame(() => {
			if (!shouldShow) return
			if (!dropsGroupRef.current || !locationVector) return
			if (locationVector.lengthSq() === 0) return

			const orientOnce = () => {
				// Outward unit normal from Earth's center through the location
				const up = locationVector.clone().normalize()

				// One-time orientation:
				// - Keep upright by aligning local up to surface normal
				// - Face the camera along the tangent plane (no pitch/roll)
				const obj = dropsGroupRef.current!
				const upVec = up.clone().normalize()
				obj.up.copy(upVec)
				const toCam = camera.position.clone().sub(obj.position)
				const planarDir = toCam.clone().projectOnPlane(upVec)
				if (planarDir.lengthSq() > 0) {
					const lookTarget = obj.position.clone().sub(planarDir)
					obj.lookAt(lookTarget)
				}
			}

			// Orient immediately on location change
			orientOnce()
		})

		return (
			<>
				{shouldShow && (
					<group ref={dropsGroupRef} scale={[8000, 500, 8000]}>
						{/* placement helper */}
						{/* <mesh position={[0, 0, 0]}>
							<planeGeometry args={[10, 10]} />
							<meshBasicMaterial
								color={'red'}
								// depthTest={false}
								// depthWrite={true}
								// transparent={true}
								// opacity={0.2}
								// alphaTest={ 0.1}
								side={THREE.DoubleSide}
							/>
						</mesh> */}

						<instancedMesh
							ref={dropsRef}
							args={[null!, null!, count]}
							renderOrder={2}
						>
							<planeGeometry args={[0.1, 2.0]} />
							<CSM
								key={vertexShader + fragmentShader}
								baseMaterial={THREE.MeshBasicMaterial}
								vertexShader={vertexShader}
								fragmentShader={fragmentShader}
								uniforms={uniforms}
								// transparent
								// depthTest={false}
								// depthWrite={false}
								alphaTest={0.1}
								side={THREE.DoubleSide}
							/>
						</instancedMesh>
					</group>
				)
				}
			</>
		);
	}
);