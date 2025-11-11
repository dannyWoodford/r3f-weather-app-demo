import React, { useRef, Suspense } from 'react'
import * as THREE from 'three'
import {
	Atmosphere,
	type AtmosphereApi,
} from '@takram/three-atmosphere/r3f'
// import { OrbitControls, Stats, Sphere, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

import Stats from './components/Stats'
import TilesRendererComponent from './components/TilesRendererComponent'
import GlobeCamera from './components/GlobeCamera'
import EnvironmentEffects from './components/EnvironmentEffects'
import CloudText from './components/text/CloudText'

export default function Scene() {
	const atmosphereRef = useRef<AtmosphereApi>(null)

	const date = Date.parse('2025-11-08T15:00:00Z')

	// useFrame(() => {
	// 	const atmosphere = atmosphereRef.current;
	// 	if (atmosphere == null) {
	// 		return;
	// 	}
	// 	atmosphere.updateByDate(date);
	// });

	return (
		<group>
			<Stats />

			<Atmosphere
				ref={atmosphereRef}
				correctAltitude={true}
				date={date}
			>
				<TilesRendererComponent />
				<GlobeCamera />

				<Suspense fallback={null}>
					<CloudText />
				</Suspense>
				
				<EnvironmentEffects />
			</Atmosphere>
		</group>
	)
}