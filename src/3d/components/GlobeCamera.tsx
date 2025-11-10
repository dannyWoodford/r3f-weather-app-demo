import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Geodetic, PointOfView, radians } from '@takram/three-geospatial'

import useWeatherStore from '../../store/GlobalState'

const GlobeCamera = () => {
	const setLocationVector = useWeatherStore(s => s.setLocationVector)

	const latitude = useWeatherStore(s => s.location.latitude)
	const longitude = useWeatherStore(s => s.location.longitude)
	const heading = 65
	const pitch = -20
	const distance = 1265

	const camera = useThree(({ camera }) => camera)

	useLayoutEffect(() => {
		const getLocVec = new Geodetic(radians(longitude), radians(latitude)).toECEF()

		new PointOfView(distance, radians(heading), radians(pitch)).decompose(
			getLocVec,
			camera.position,
			camera.quaternion,
			camera.up
		)

		setLocationVector(getLocVec)
	}, [longitude, latitude, heading, pitch, distance, camera])

	return (null)
}

export default GlobeCamera
