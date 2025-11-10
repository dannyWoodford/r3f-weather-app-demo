import {
	TilesPlugin,
	TilesRenderer,
	TilesAttributionOverlay,
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

const dracoLoader = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

export default function TilesRendererComponent() {
	const assetId = 2275207
	
	// night
	// const assetId = 3812

	return (
		<group
		>
			<TilesRenderer 
			>
				<TilesPlugin plugin={CesiumIonAuthPlugin} args={{ apiToken: import.meta.env.VITE_ION_KEY, assetId: assetId, autoRefreshToken: true }} />
				<TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
				<TilesPlugin plugin={TileCompressionPlugin} />
				<TilesPlugin plugin={UpdateOnChangePlugin} />
				<TilesPlugin plugin={TilesFadePlugin} />


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
