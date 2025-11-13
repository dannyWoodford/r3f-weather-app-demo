import React, { useCallback, useEffect, useRef } from 'react'
import {
	TilesPlugin,
	TilesRenderer,
	// TilesAttributionOverlay,
	GlobeControls,
} from '3d-tiles-renderer/r3f';
// Plugins
import {
	CesiumIonAuthPlugin,
	UpdateOnChangePlugin,
	TileCompressionPlugin,
	TilesFadePlugin,
	GLTFExtensionsPlugin,
} from '3d-tiles-renderer/plugins';
import { radians } from '@takram/three-geospatial'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

import { TileCreasedNormalsPlugin } from '../plugins/TileCreasedNormalsPlugin'
import useWeatherStore from '../../store/GlobalState'

export default function TilesRendererComponent() {
	const assetId = 2275207

	// night
	// const assetId = 3812

	// Track current location and ensure handlers fire once per location change
	const locationVersion = useWeatherStore(s => s.locationVersion)
	const flowId = useWeatherStore(s => s.flowId)
	const phase = useWeatherStore(s => s.phase)
	const markTerrainReady = useWeatherStore(s => s.markTerrainReady)
	const setSpinnerVisible = useWeatherStore(s => s.setSpinnerVisible)
	const spinnerVisible = useWeatherStore(s => s.spinnerVisible)

	const hasStartFiredRef = useRef(false)
	const hasEndFiredRef = useRef(false)

	useEffect(() => {
		hasStartFiredRef.current = false
		hasEndFiredRef.current = false
	}, [locationVersion])

	const handleTilesLoadStart = useCallback(() => {
		// Only consider the first start per location
		if (hasStartFiredRef.current) return
		// Only show spinner for the active flow
		if (phase !== 'loadingTerrain') return
		hasStartFiredRef.current = true
		// console.log('[Tiles] onTilesLoadStart (once per location) →', {
		// 	flowId,
		// })
		setSpinnerVisible(true)
	}, [flowId, phase, setSpinnerVisible])

	const handleTilesLoadEnd = useCallback(() => {
		// Only consider the first load end per location
		if (hasEndFiredRef.current) return
		// Only complete terrain step for the active flow
		if (phase !== 'loadingTerrain') {
			// Initial load case (no active flow): ensure spinner hides
			if (spinnerVisible) setSpinnerVisible(false)
			hasEndFiredRef.current = true
			return
		}
		hasEndFiredRef.current = true
		// console.log('[Tiles] onTilesLoadEnd (once per location) →', {
		// 	flowId,
		// })
		markTerrainReady(flowId)
	}, [flowId, phase, spinnerVisible, setSpinnerVisible, markTerrainReady])

	return (
		<group>
			<TilesRenderer
				onTilesLoadStart={handleTilesLoadStart}
				onTilesLoadEnd={handleTilesLoadEnd}
			>
				<TilesPlugin plugin={CesiumIonAuthPlugin} args={[{
					apiToken: import.meta.env.VITE_ION_KEY,
					assetId: assetId,
					autoRefreshToken: true
				}]}
				/>
				<TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
				<TilesPlugin plugin={TileCompressionPlugin} />
				<TilesPlugin plugin={UpdateOnChangePlugin} />
				<TilesPlugin plugin={TilesFadePlugin} />

				<TilesPlugin
					plugin={TileCreasedNormalsPlugin}
					args={[{ creaseAngle: radians(30) }]}
				/>


				{/* Attributions */}
				{/* <TilesAttributionOverlay /> */}

				{/* Controls */}
				<GlobeControls
					enableDamping={true}
					adjustHeight={false}
					maxAltitude={Math.PI * 0.55} // Permit grazing angles
				// maxDistance={7500}
				/>
			</TilesRenderer>
		</group>
	)
}
