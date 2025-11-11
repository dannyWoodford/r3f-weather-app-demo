import React, { useRef, useEffect } from 'react'
import { Billboard } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'

import { Group } from 'three'

import CloudTextParticles from './CloudTextParticles'

import useWeatherStore from '../../../store/GlobalState'

export default function CloudText() {
	const locationVector = useWeatherStore(s => s.locationVector)
	
	const textRef = useRef<Group>(null)

	const camera = useThree(({ camera }) => camera)

	useEffect(() => {
		if (!textRef.current || !locationVector) return
		if (locationVector.lengthSq() === 0) return

		// Outward unit normal from Earth's center through the location
		const up = locationVector.clone().normalize()

		// set Text x units above the surface at that location
		const elevated = locationVector.clone().addScaledVector(up, 500)

		textRef.current.position.copy(elevated)

		// One-time orientation:
		// - Keep upright by aligning local up to surface normal
		// - Face the camera along the tangent plane (no pitch/roll)
		const obj = textRef.current
		const upVec = up.clone().normalize()
		obj.up.copy(upVec)
		const toCam = camera.position.clone().sub(obj.position)
		const planarDir = toCam.clone().projectOnPlane(upVec)
		if (planarDir.lengthSq() > 0) {
			const lookTarget = obj.position.clone().add(planarDir)
			obj.lookAt(lookTarget)
		}

	}, [locationVector]);

	const { followCamera } = useControls(
		'Cloud Text',
		{
			followCamera: false,
		},
		{ collapsed: false }
	)

	return (
		<group ref={textRef}>

			{/* <mesh position={[0,0,-100]}>
				<planeGeometry args={[2000, 600]} />
				<meshBasicMaterial
					color={'white'}
					depthTest={false}
					transparent={false}
					depthWrite={ true}
					opacity={0.8}
					// transparent={ true}
					// alphaTest={ 0.1}
					side={ THREE.DoubleSide}
				// side={THREE.DoubleSide}
				/>
			</mesh> */}
		

			{followCamera && (
				<Billboard follow={true} >
					<CloudTextParticles text='PARTLY CLOUDY' scale={50} />
				</Billboard>
			)}
			{!followCamera && (
				<CloudTextParticles text='PARTLY CLOUDY' scale={50} />
			)}

		</group>
	)
}
