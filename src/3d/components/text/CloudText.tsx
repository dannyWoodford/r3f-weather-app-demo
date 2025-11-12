import React, { useRef, useEffect, useState } from 'react'
import { Group } from 'three'
import { Billboard } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useControls } from 'leva'

import CloudTextParticles from './CloudTextParticles'

import useWeatherStore from '../../../store/GlobalState'
import { getWeatherDescription } from '../../../lib/weatherCodes'

export default function CloudText() {
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)
	const locationVector = useWeatherStore((s) => s.locationVector)
	const weatherCode = useWeatherStore((s) => s.data?.now.weatherCode ?? null)

	// Compute display condition early so effects can depend on it
	const desc = getWeatherDescription(weatherCode)
	const conditionText = desc.toUpperCase()
	const baseShouldShow = hasEnteredApp && desc !== 'Unknown'

	// Delay showing the text by X seconds after base condition becomes true
	const [delayDone, setDelayDone] = useState(false)
	useEffect(() => {
		if (!baseShouldShow) {
			setDelayDone(false)
			return
		}
		const timer = setTimeout(() => setDelayDone(true), 500)
		return () => clearTimeout(timer)
	}, [baseShouldShow])

	const shouldShow = baseShouldShow && delayDone

	const textRef = useRef<Group>(null)

	const camera = useThree(({ camera }) => camera)

	useEffect(() => {
		// Only position/orient when the text is actually being shown
		if (!shouldShow) return
		if (!textRef.current || !locationVector) return
		if (locationVector.lengthSq() === 0) return

		// Outward unit normal from Earth's center through the location
		const up = locationVector.clone().normalize()

		// set Text x units above the surface at that location
		const elevated = locationVector.clone().addScaledVector(up, 650)

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
	}, [locationVector, shouldShow])

	const { followCamera } = useControls(
		'cloud text',
		{
			followCamera: false,
		},
		{ collapsed: true }
	)

	return (
		<>
			{shouldShow && (
				<group ref={textRef}>
					{/* placement helper */}
					{/* <mesh position={[0,0,-60]}>
					<planeGeometry args={[2400, 400]} />
					<meshBasicMaterial
						color={'white'}
						// depthTest={false}
						depthWrite={true}
						transparent={true}
						opacity={0.2}
						// alphaTest={ 0.1}
						// side={ THREE.DoubleSide}
					/>
				</mesh> */}

					{followCamera && (
						<Billboard follow={true}>
							<CloudTextParticles text={conditionText} scale={100} />
						</Billboard>
					)}
					{!followCamera && <CloudTextParticles text={conditionText} scale={100} />}
				</group>
			)}
		</>
	)
}
