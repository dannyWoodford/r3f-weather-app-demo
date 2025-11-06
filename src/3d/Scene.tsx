import React, { useState, useEffect } from 'react'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { useControls } from 'leva'

import { StatsPanel } from './components/StatsPanel'

import PrimitivesFactory from './components/PrimitivesFactory'
import TilesRendererComponent from './components/TilesRendererComponent'
import Raycaster from './components/Raycaster'

export default function Scene() {
	// const { performance } = useControls('Monitoring', {
	// 	performance: true,
	// })

	const [tilesLoaded, setTilesLoaded] = useState(false)

	const tilesLoadedHandler = () => {
		setTilesLoaded(true)
	}


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
				{/* helper to visualize light position */}
				{/* <Sphere args={[1]}>
          <meshBasicMaterial color={"green"} />
        </Sphere> */}
				<orthographicCamera
					attach="shadow-camera"
					args={[-40.5, 40.5, 40.5, -40.5, 0.1, 200]}
				/>
			</directionalLight>

			{/* <ambientLight intensity={0.2} /> */}

			{/* <Grid
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
			/> */}

			<PrimitivesFactory />
			<TilesRendererComponent groupPos={[0, 0, 0]} tilesLoadedHandler={tilesLoadedHandler} />

			{/* <Raycaster tilesLoaded={tilesLoaded} /> */}
		</>
	)
}