// import * as THREE from 'three/webgpu'
// import * as TSL from 'three/tsl'
import { Canvas, extend } from '@react-three/fiber'
import { Leva } from 'leva'

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
				camera={{
					fov: 70,
					// near: 0.1,
					far: 1000,
					position: [0, 4, 9],
				}}
				shadows
			>
				<Scene />
			</Canvas>
		</>
	)
}

