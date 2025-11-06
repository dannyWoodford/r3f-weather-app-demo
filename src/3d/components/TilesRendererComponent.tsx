import React, { useRef, useMemo, useState, useEffect } from 'react'
// import * as THREE from 'three/webgpu'
import * as THREE from 'three'
import { useControls } from 'leva'

import { TilesRenderer, TilesAttributionOverlay, TilesPlugin } from '3d-tiles-renderer/r3f';
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

// const TILESET_URL = 'models/city_1/output_folder/tileset.json';


import useRaycasterObjects from "../helpers/useRaycasterObjects";

interface TilesRendererComponentProps {
	groupPos?: [number, number, number];
	tilesLoadedHandler: () => void;
}

export default function TilesRendererComponent({ groupPos = [0, 0, 0], tilesLoadedHandler }: TilesRendererComponentProps) {
	const tileRendererRef = useRef<any>()

	const [loaded, setLoaded] = useState(false)
	
	const levaParams = {
		assetId: {
			value: '354759',
			options: {
				'Nearmap Boston Photogrammetry': '354759',
				'Cesium OSM Buildings': '96188',
				'Google Photorealistic 3D Tiles': '2275207',
			},
		},
	};

	const { assetId } = useControls(levaParams);

	// useFrame(() => {
	// 	if (!tileRendererRef.current?.group) return;
	// 	if (!tilesLoaded) return;

	// 	// console.log('tileRendererRef', tileRendererRef.current?.group.position)

	// 	// tileRendererRef.current?.group.position.set(0, -6368366, 1290)
	// 	// tileRendererRef.current?.group.position.y += 1
		
	// })

	useEffect(() => {
		if (!tileRendererRef.current) return;
		
		const box = new THREE.Box3().setFromObject(tileRendererRef.current.group); // Calculate the bounding box of the object
		const center = new THREE.Vector3();
		box.getCenter(center); // Get the center point of the bounding box

		tileRendererRef.current.group.position.sub(center); // Translate the object so its center aligns with the world origin
		tileRendererRef.current.group.position.y -= 50; // Add Y offset

		console.log('box', box)
		console.log('tileRendererRef', tileRendererRef.current?.group.position)

	}, [loaded]);

	return (
		<group
		position={groupPos}
		// rotation={[1.5, 0, Math.PI]} 
		// name="TilesRenderer - Group"
		>
			<TilesRenderer 
				ref={tileRendererRef} 
				// url={TILESET_URL} 
				// key={assetId}
				onLoadTileSet={() => {
					// const box = new THREE.Box3().setFromObject(tileRendererRef.current.group); // Calculate the bounding box of the object
					// const center = new THREE.Vector3();
					// box.getCenter(center); // Get the center point of the bounding box

					// tileRendererRef.current.group.position.sub(center); // Translate the object so its center aligns with the world origin
					// // tileRendererRef.current.group.position.y -= 100; // Add Y offset

					// console.log('box', box)
					console.log('tileRendererRef', tileRendererRef.current?.group.position)
				}}
				// onLoadModel={(scene, tile) => {
				// 	console.log('onLoadModel', scene, tile)
				// }}
				onLoadContent={() => console.log('onLoadModel', )}
				onTilesLoadEnd={() => {
					if (!tileRendererRef.current) return;
					
					tilesLoadedHandler()

					setLoaded(true)
					
					// useRaycasterObjects(tileRendererRef.current?.group);
					
					// console.log('tileRendererRef', tileRendererRef.current?.group.position)
					
					// tileRendererRef.current?.group.position.set(0, -6368366, 1290)
					// tileRendererRef.current?.group.position.set(0, -100, 0)
				}}
				
				// if false then "update" is not called
				enabled={true}
				// enabled={false}

				// pass properties to apply to the tile set root object
				// group={{
				// 	position: [0, -100000, 0],
				// 	// rotation: [Math.PI / 2, 0, 0],
				// }}

				// set options to the TilesRenderer object
				// errorTarget={6}

				// set nested object options of the TilesRenderer
				// parseQueue-maxJobs={30}
				// downloadQueue-maxJobs={10}
				// lruCache-minBytesSize={0.25 * 1e6}
				// lruCache-maxBytesSize={300.0 * 1e6}
			>
				<TilesPlugin plugin={CesiumIonAuthPlugin} args={{ apiToken: import.meta.env.VITE_ION_KEY, assetId: assetId }} />

				{/* <TilesPlugin plugin={TileCompressionPlugin} /> */}
				<TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
				<TilesPlugin plugin={ReorientationPlugin} />
				<TilesPlugin plugin={UpdateOnChangePlugin} />
				{/* <TilesPlugin plugin={TilesFadePlugin} /> */}

				{/* Attributions */}
				{/* <TilesAttributionOverlay /> */}

				{/* <mesh rotation-x={- Math.PI / 2} scale={1} position-z={0}>
					<coneGeometry args={[1.5]} />
					<meshStandardMaterial color={'red'} />
				</mesh> */}

			</TilesRenderer>
			{/* <TilesRenderer 
				// ref={tileRendererRef} 
				url={TILESET_URL} 
				// key={assetId}
				onLoadTileSet={() => console.log('onLoadTileSet')}
				// onLoadModel={(scene, tile) => console.log('onLoadModel', scene, tile)}
				onTilesLoadEnd={() => {
					if (!tileRendererRef.current) return;
					
					// tilesLoadedHandler()
					
					// useRaycasterObjects(tileRendererRef.current?.group);
					
					// console.log('tileRendererRef', tileRendererRef.current?.group)
					
					// tileRendererRef.current?.group.position.set(0, -6368366, 1290)
				}}
			>
			</TilesRenderer> */}
		</group>
	)
}
