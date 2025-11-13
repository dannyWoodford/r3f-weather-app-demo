import { Vector3 } from 'three'

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
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import { radians } from '@takram/three-geospatial'
const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

import { TileCreasedNormalsPlugin } from '../plugins/TileCreasedNormalsPlugin'
import React, { useCallback, useEffect, useRef } from 'react'
import useWeatherStore from '../../store/GlobalState'

export default function TilesRendererComponent() {
	const assetId = 2275207

	// night
	// const assetId = 3812

	// Track current location and ensure handlers fire once per location change
	const locationVector = useWeatherStore(s => s.locationVector)
	const flowId = useWeatherStore(s => s.flowId)
	const markTerrainReady = useWeatherStore(s => s.markTerrainReady)
	const setSpinnerVisible = useWeatherStore(s => s.setSpinnerVisible)

	const lastKeyRef = useRef<Vector3>(new Vector3(0, 0, 0))
	const hasStartFiredRef = useRef(false)
	const hasEndFiredRef = useRef(false)

	useEffect(() => {
		if (!locationVector.equals(lastKeyRef.current)) {
			lastKeyRef.current = locationVector
			hasStartFiredRef.current = false
			hasEndFiredRef.current = false
		}
	}, [locationVector])

	const handleTilesLoadStart = useCallback(() => {
		// Only consider the first start per location
		if (hasStartFiredRef.current) return
		hasStartFiredRef.current = true
		console.log('[Tiles] onTilesLoadStart (once per location) →', {
			location: lastKeyRef.current.toArray(),
			flowId,
		})
		setSpinnerVisible(true)
	}, [flowId, setSpinnerVisible])

	const handleTilesLoadEnd = useCallback(() => {
		// Only consider the first load end per location
		if (hasEndFiredRef.current) return
		hasEndFiredRef.current = true
		console.log('[Tiles] onTilesLoadEnd (once per location) →', {
			location: lastKeyRef.current.toArray(),
			flowId,
		})
		markTerrainReady(flowId)
	}, [flowId, markTerrainReady])

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
