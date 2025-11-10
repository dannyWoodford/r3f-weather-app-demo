import React, { useRef, useEffect } from 'react'
import { useTexture, Billboard } from '@react-three/drei'
import { Mesh } from 'three'

import useWeatherStore from '../../../store/GlobalState'


export default function CloudText() {
	const locationVector = useWeatherStore(s => s.locationVector)

	const texture = useTexture('/textures/smoke.png')

	const textRef = useRef<Mesh>(null)

	useEffect(() => {
		if (!textRef.current || !locationVector) return
		if (locationVector.lengthSq() === 0) return

		// Outward unit normal from Earth's center through the location
		const up = locationVector.clone().normalize()

		// set Text x units above the surface at that location
		const elevated = locationVector.clone().addScaledVector(up, 300)

		textRef.current.position.copy(elevated)
	}, [locationVector]);

	return (
		<group ref={textRef}>
			<Billboard follow={true}>
				<mesh >
					<planeGeometry args={[100, 100]}/>
					<meshBasicMaterial
						color={0xffffff}
						alphaMap={texture}
						depthTest={false}
						opacity={.3}
						transparent={true}
					/>
				</mesh>
			</Billboard>
		</group>
	)
}
