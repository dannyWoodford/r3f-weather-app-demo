import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Geodetic, PointOfView, radians } from '@takram/three-geospatial'

import useWeatherStore from '../../store/GlobalState'

const GlobeCamera = () => {
	const latitude = useWeatherStore(s => s.location.latitude)
	const longitude = useWeatherStore(s => s.location.longitude)
	const heading = 65
	const pitch = -20
	const distance = 1265

	const camera = useThree(({ camera }) => camera)

	useLayoutEffect(() => {
		new PointOfView(distance, radians(heading), radians(pitch)).decompose(
			new Geodetic(radians(longitude), radians(latitude)).toECEF(),
			camera.position,
			camera.quaternion,
			camera.up
		)
	}, [longitude, latitude, heading, pitch, distance, camera])

	return (null)
}

export default GlobeCamera
