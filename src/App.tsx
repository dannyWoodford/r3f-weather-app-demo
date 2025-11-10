// import * as THREE from 'three/webgpu'
// import * as TSL from 'three/tsl'
import { Canvas, extend } from '@react-three/fiber'
import { Leva } from 'leva'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'


import Scene from './3d/Scene'
import UI from './UI/index'
import OnboardingOverlay from './UI/components/OnboardingOverlay'

import useWeatherStore from './store/GlobalState'


// declare module '@react-three/fiber' {
// 	interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
// }

// extend(THREE as any)

export default function App() {
	const { hasEnteredApp } = useWeatherStore()

	return (
		<>
			<Leva
				collapsed={false}
				// oneLineLabels={false}
				// flat={true}
				hidden={!hasEnteredApp}
				theme={{
					// sizes: {
					// 	titleBarHeight: '28px',
					// },
					// fontSizes: {
					// 	root: '10px',
					// },
				}}
			/>

			<OnboardingOverlay />

			<UI />

			<Canvas
				// dpr={[1, 2]}
				// gl={{
				// 	antialias: true,
				// 	toneMapping: ACESFilmicToneMapping,
				// 	outputColorSpace: SRGBColorSpace,
				// }}
				// gl={async (props) => {
				// 	const renderer = new THREE.WebGPURenderer(props as any)
				// 	await renderer.init()
				// 	return renderer
				// }}
				
				// shadows
				gl={{
					depth: false,
					toneMappingExposure: 15,
				}}
				// camera={{
				// 	near: 10,
				// 	far: 4e5,
				// 	// See the Clouds/Basic story for deriving ECEF coordinates and rotation.
				// 	// position: [4529893.894855564, 2615333.425024031, 3638042.815326614],
				// 	// rotation: [0.6423512931563148, -0.2928348796035058, -0.8344824769956042]
				// }}
			>
				<Scene />
			</Canvas>
		</>
	)
}

