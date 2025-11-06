import { Object3D, Mesh, Group } from "three"; // Import Object3D type
// import * as THREE from 'three';
import * as THREE from 'three/webgpu'


export default function useRaycasterObjects(raycasterGroup: Group): Object3D[] {
	let raycasterObjectsArr: Object3D[] = [];

	raycasterGroup.traverse((child: Object3D) => {
		// This will probably need to be adjusted once the app gets more complex or if the floor is not flat
		if (
			(child as Mesh).isMesh
		) {

			
			child.castShadow = true
			child.receiveShadow = true

			// console.log('child', child)
			// console.log('child.object', child.object)

			// child.userData = { clickable: true }
			child.userData.clickable = true

			// child.material = new THREE.MeshPhysicalMaterial();

			raycasterObjectsArr.push(child);
		}
	});

	// console.log('raycasterObjectsArr', raycasterObjectsArr.length)

	return raycasterObjectsArr;
}
