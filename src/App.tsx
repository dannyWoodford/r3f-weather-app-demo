// import * as THREE from 'three/webgpu'
// import * as TSL from 'three/tsl'
import { Canvas, extend } from '@react-three/fiber'

import { Leva } from 'leva'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'

import Scene from './3d/Scene'
import Sidebar from './UI/Sidebar'

// declare module '@react-three/fiber' {
// 	interface ThreeElements extends ThreeToJSXElements<typeof THREE> { }
// }

// extend(THREE as any)

export default function App() {
	return (
		<>
			<Leva
				collapsed={false}
				oneLineLabels={false}
				flat={true}
				theme={{
					sizes: {
						titleBarHeight: '28px',
					},
					fontSizes: {
						root: '10px',
					},
				}}
			/>

			<Sidebar />

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
					fov: 55,
					near: 0.1,
					// far: 500,
					far: 10000,
					position: [0, 4, 9],
				}}
				shadows
			>
				<Scene />
			</Canvas>
		</>
	)
}

