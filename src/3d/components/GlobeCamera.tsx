import { useLayoutEffect, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Geodetic, PointOfView, radians } from '@takram/three-geospatial'
import { useControls } from 'leva'
import { PerspectiveCamera } from "three";

import { usePovControls } from '../helpers/usePovControls'

import useWeatherStore from '../../store/GlobalState'

const GlobeCamera = () => {
	const setLocationVector = useWeatherStore(s => s.setLocationVector)

	const latitude = useWeatherStore(s => s.location.latitude)
	const longitude = useWeatherStore(s => s.location.longitude)
	const initHeading = 65
	const initPitch = -37
	const distance = 4751


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

		new PointOfView(distance, radians(initHeading), radians(initPitch)).decompose(
			getLocVec,
			camera.position,
			camera.quaternion,
			camera.up
		)

		setLocationVector(getLocVec)
	}, [longitude, latitude, initHeading, initPitch, distance, camera])

	// Update Camera FOV
	useEffect(() => {
		(camera as PerspectiveCamera).fov = fovValue;
		(camera as PerspectiveCamera).updateProjectionMatrix();
		
	}, [camera, fovValue]);


	return (null)
}

export default GlobeCamera
