import React from 'react'
import { OrbitControls, Stats } from '@react-three/drei'
import { Perf } from 'r3f-perf'

// import * as THREE from 'three/webgpu'
import * as THREE from 'three'


// import { StatsPanel } from './components/StatsPanel'
// import SplatComponent from './components/SplatComponent'
import TilesRendererComponent from './components/TilesRendererComponent'
import EnvironmentEffects from './components/EnvironmentEffects'
import GlobeCamera from './components/GlobeCamera'

export default function Scene() {

	return (
		<>
			{/* <OrbitControls makeDefault /> */}
			
			{/* helper to visualize light position */}
			{/* <Sphere args={[12742000]}>
				<meshPhysicalMaterial color={"red"} />
			</Sphere> */}

			{/* <ambientLight intensity={100} /> */}

			{/* <StatsPanel /> */}
			<Stats className='stats'/>
			{/* <Perf className='stats' /> */}

			{/* <SplatComponent /> */}

			<TilesRendererComponent />
			
			<GlobeCamera />
			<EnvironmentEffects />
		</>
	)
}