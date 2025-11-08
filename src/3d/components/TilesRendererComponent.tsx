import React, { useRef, useMemo, useState, useEffect } from 'react'
// import * as THREE from 'three/webgpu'
import * as THREE from 'three'
import { useControls } from 'leva'

import {
	TilesPlugin,
	TilesRenderer,
	TilesAttributionOverlay,
	GlobeControls,
	EastNorthUpFrame,
	CompassGizmo,
} from '3d-tiles-renderer/r3f';
// Plugins
import {
	CesiumIonAuthPlugin,
	UpdateOnChangePlugin,
	TileCompressionPlugin,
	TilesFadePlugin,
	GLTFExtensionsPlugin,
	ReorientationPlugin
} from '3d-tiles-renderer/plugins';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');


export default function TilesRendererComponent() {
	const assetId = 2275207

	return (
		<group
		>
			<TilesRenderer group={{ rotation: [- Math.PI / 2, 0, 0] }}>
				<TilesPlugin plugin={CesiumIonAuthPlugin} args={{ apiToken: import.meta.env.VITE_ION_KEY, assetId: assetId, autoRefreshToken: true }} />
				<TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
				<TilesPlugin plugin={TileCompressionPlugin} />
				<TilesPlugin plugin={UpdateOnChangePlugin} />
				<TilesPlugin plugin={TilesFadePlugin} />

				{/* Controls */}
				<GlobeControls enableDamping={true} />

				{/* Attributions */}
				<TilesAttributionOverlay />

				{/* Pointer to NASA JPL */}
				{/* <EastNorthUpFrame lat={34.2013 * MathUtils.DEG2RAD} lon={- 118.1714 * MathUtils.DEG2RAD} height={350}>
					<Pointer />
				</EastNorthUpFrame>; */}

				{/* Add compass gizmo */}
				{/* <CompassGizmo /> */}

				{/* <TilesLoadingBar /> */}
			</TilesRenderer>
		</group>
	)
}
