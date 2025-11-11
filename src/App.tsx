import React, { useMemo } from 'react'
// import * as THREE from 'three/webgpu'
// import * as TSL from 'three/tsl'
import { Canvas, extend } from '@react-three/fiber'

import LevaConfig from './LevaConfig'
import Scene from './3d/Scene'
import UI from './UI/index'
import OnboardingOverlay from './UI/components/OnboardingOverlay'

// declare module '@react-three/fiber' {
// 	interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
// }

// extend(THREE as any)

export default function App() {
	const gl = useMemo(() => ({ 
		depth: false, 
		toneMappingExposure: 8 
	}), []);

	const camera = useMemo(() => ({ 
		near: 0.01, 
		far: 4e5, 
		fov: 70,
		// See the Clouds/Basic story for deriving ECEF coordinates and rotation.
		// position: [4529893.894855564, 2615333.425024031, 3638042.815326614],
		// rotation: [0.6423512931563148, -0.2928348796035058, -0.8344824769956042]
	}), []);

	return (
		<>
			<LevaConfig />

			<OnboardingOverlay />

			<UI />

			<Canvas
				dpr={[1, 2]}
				// gl={async (props) => {
				// 	const renderer = new THREE.WebGPURenderer(props as any)
				// 	await renderer.init()
				// 	return renderer
				// }}
				
				// shadows
				gl={gl} 
				camera={camera}
			>
				<Scene />
			</Canvas>
		</>
	)
}

