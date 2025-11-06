import React, { useMemo } from 'react'
// import * as THREE from 'three'
import * as THREE from 'three/webgpu'
// import { Mesh } from 'three'
import { useThree, useFrame } from "@react-three/fiber";


export default function Raycaster(tilesLoaded: boolean) {

	// ------ Raycasting ---------------------------------------------------------------------------------------------------------------------------------------
	// Raycasting is used for mouse picking (working out what objects in the 3d space the mouse is over) amongst other things.
	const raycaster = useMemo(() => new THREE.Raycaster(), []);

	// ------ Navigation ---------------------------------------------------------------------------------------------------------------------------------------
	const { camera, scene } = useThree();

	const onMousePicker = (pointer: THREE.Vector2) => {
		// update the picking ray with the camera and pointer position
		raycaster.setFromCamera(pointer, camera);

		// const intersects = raycaster.intersectObjects(scene);
		const intersects = raycaster.intersectObjects(scene.children, true);

		// console.log('intersects', intersects)

		if (intersects.length > 0) {
			if (intersects[0].object.userData.clickable === true) {
				console.log('intersects[0].object', intersects[0].object)

				if (intersects[0].object instanceof THREE.Mesh) {
					intersects[0].object.material = new THREE.MeshPhysicalMaterial({ color: 'red' });
				}
				// intersects[0].object.material.wireframe = true
			} else {
				console.log('else 1', intersects)
			}
		} else {
			console.log('else 2', intersects)
		}
	};


	useFrame((state) => {
		if (!tilesLoaded) return;

		onMousePicker(state.pointer);
	});


	return (
		<></>
	)
}
