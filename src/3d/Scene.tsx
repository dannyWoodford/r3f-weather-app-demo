import React, { useRef, Suspense } from 'react'
import {
	Atmosphere,
	type AtmosphereApi,
} from '@takram/three-atmosphere/r3f'
// import { useFrame } from '@react-three/fiber'
import {
	Bloom,
	BrightnessContrast,
	EffectComposer,
} from "@react-three/postprocessing";

import Stats from './components/Stats'
import TilesRendererComponent from './components/TilesRendererComponent'
import JumpToLocation from './components/JumpToLocation'
import EnvironmentEffects from './components/EnvironmentEffects'
import CloudText from './components/text/CloudText'
import useWeatherStore from '../store/GlobalState'

import { Rain } from "./components/Rain";
import { useMakeRain } from "./components/Rain/useMakeRain";

export default function Scene() {
	const atmosphereRef = useRef<AtmosphereApi>(null)

	const westernHemisphereDate = Date.parse('2025-11-08T15:45:00Z')
	const easternHemisphereDate = Date.parse('2025-07-08T09:00:00Z')

	const longitude = useWeatherStore(s => s.location.longitude)
	const isEastern = longitude > 0
	const date = isEastern
		? easternHemisphereDate
		: westernHemisphereDate

	const [rainProgressRef, onRainStart, rainStarted] = useMakeRain();

	return (
		<group>
			<Stats />

			<Atmosphere
				ref={atmosphereRef}
				correctAltitude={true}
				date={date}
			>
		
				<Rain rainProgressRef={rainProgressRef}>
					{/* <Floor rainProgressRef={rainProgressRef} /> */}
				</Rain>

				<TilesRendererComponent />
				<JumpToLocation />

				<Suspense fallback={null}>
					<CloudText />
				</Suspense>

				<EnvironmentEffects />
				{/* <EffectComposer disableNormalPass>
					<BrightnessContrast brightness={0.05} contrast={0.2} />
					<Bloom luminanceThreshold={2} mipmapBlur intensity={1} />
				</EffectComposer> */}
			</Atmosphere>
		</group>
	)
}