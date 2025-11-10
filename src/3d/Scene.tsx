import React from 'react'
import { OrbitControls, Stats, Sphere, Environment } from '@react-three/drei'
import { Perf } from 'r3f-perf'

// import * as THREE from 'three/webgpu'
import * as THREE from 'three'


// import { StatsPanel } from './components/StatsPanel'
// import SplatComponent from './components/SplatComponent'
// import TilesRendererComponent from './components/TilesRendererComponent'
// import GlobeCamera from './components/GlobeCamera'
import EnvironmentEffects from './components/EnvironmentEffects'
import CloudText from './components/text/CloudText'

export default function Scene() {

	return (
		<group>
			{/* <OrbitControls makeDefault /> */}
			
			{/* <Environment
				preset="night"
				background={false}
				backgroundBlurriness={0} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
				backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
				environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
			/> */}

			{/* helper to visualize light position */}
			{/* <Sphere args={[3]}>
				<meshPhysicalMaterial color={"red"} />
			</Sphere> */}

			{/* <ambientLight intensity={100} /> */}

			{/* <StatsPanel /> */}
			{/* <Stats className='stats'/> */}
			<Perf className='stats' />

			{/* <SplatComponent /> */}

			{/* <CloudText /> */}

			{/* <TilesRendererComponent /> */}
			
			{/* <GlobeCamera /> */}
			<EnvironmentEffects />
		</group>
	)
}