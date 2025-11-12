import { useLayoutEffect, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Geodetic, PointOfView, radians } from '@takram/three-geospatial'
import { useControls } from 'leva'
import { PerspectiveCamera } from "three";

import { usePovControls } from '../helpers/usePovControls'

import useWeatherStore from '../../store/GlobalState'
import { useCloudCoverage } from '../../hooks/useCloudCoverage'

const JumpToLocation = () => {
	const setLocationVector = useWeatherStore(s => s.setLocationVector)

	const latitude = useWeatherStore(s => s.location.latitude)
	const longitude = useWeatherStore(s => s.location.longitude)
	const initHeading = 65
	const basePitch = -37
	const distance = 4751

	// Weather → coverage → recommended pitch
	const weatherCode = useWeatherStore(s => s.data?.now.weatherCode ?? null)
	const { recommendedPitch } = useCloudCoverage(weatherCode, 0.0, basePitch)


	const camera = useThree(({ camera }) => camera)
	usePovControls(camera, { collapsed: false })

	const { fov: fovValue } = useControls(
		'globe camera',
		{
			fov: { value: 70, min: 20, max: 120, step: 1 },
		},
		{ collapsed: false }
	)
	useLayoutEffect(() => {
		const getLocVec = new Geodetic(radians(longitude), radians(latitude)).toECEF()

		new PointOfView(distance, radians(initHeading), radians(recommendedPitch)).decompose(
			getLocVec,
			camera.position,
			camera.quaternion,
			camera.up
		)

		setLocationVector(getLocVec)
	}, [longitude, latitude, initHeading, recommendedPitch, distance, camera])

	// Update Camera FOV
	useEffect(() => {
		(camera as PerspectiveCamera).fov = fovValue;
		(camera as PerspectiveCamera).updateProjectionMatrix();

	}, [camera, fovValue]);

	// animate the initHeading and initPitch to mouse movments

	return (null)
}

export default JumpToLocation
