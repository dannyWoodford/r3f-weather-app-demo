import React from 'react'
import { OrbitControls, Grid, Environment, Sphere } from '@react-three/drei'
// import * as THREE from 'three/webgpu'
import * as THREE from 'three'


import { StatsPanel } from './components/StatsPanel'

export default function Scene() {
	// const { performance } = useControls('Monitoring', {
	// 	performance: true,
	// })

	return (
		<>
			<StatsPanel />

			<Environment
				preset="night"
				background={false}
				backgroundBlurriness={0} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
				backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
				environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
			/>

			<OrbitControls makeDefault />

			<directionalLight
				position={[11, 36, -32]}
				castShadow
				intensity={1.5}
				shadow-mapSize={2048}
				shadow-bias={-0.001}
			>
				<orthographicCamera
					attach="shadow-camera"
					args={[-40.5, 40.5, 40.5, -40.5, 0.1, 200]}
				/>
			</directionalLight>

			{/* <ambientLight intensity={0.2} /> */}

			<Grid
				position={[0, 0, 0]}
				args={[70, 70]}
				cellSize={0.5}
				cellThickness={1}
				cellColor={'#6f6f6f'}
				sectionSize={2.5}
				sectionThickness={1.5}
				sectionColor={'#823e3e'}
				fadeDistance={50}
				fadeStrength={2}
				followCamera={false}
				infiniteGrid={true}
				side={THREE.DoubleSide}
			/>

			{/* helper to visualize light position */}
			<Sphere args={[1]}>
				<meshPhysicalMaterial color={"green"} />
			</Sphere>

		</>
	)
}