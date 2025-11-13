import { useLayoutEffect, useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Geodetic, PointOfView, radians } from '@takram/three-geospatial'
import { useControls } from 'leva'
import { PerspectiveCamera } from "three";

import { usePovControls } from '../helpers/usePovControls'

import { CAMERA_PITCH_ANIM_MS } from '../../store/timings'
import useWeatherStore from '../../store/GlobalState'
import { useCloudCoverage } from '../../hooks/useCloudCoverage'

const JumpToLocation = () => {
	const setLocationVector = useWeatherStore(s => s.setLocationVector)
	const hasEnteredApp = useWeatherStore((s) => s.hasEnteredApp)
	const phase = useWeatherStore(s => s.phase)

	const latitude = useWeatherStore(s => s.location.latitude)
	const longitude = useWeatherStore(s => s.location.longitude)
	const initHeading = 65
	const basePitch = -37
	const distance = 4751

	// Animation state
	const locVecRef = useRef<ReturnType<Geodetic['toECEF']> | null>(null)
	const currentPitchRef = useRef(basePitch)
	const fromPitchRef = useRef(basePitch)
	const toPitchRef = useRef(basePitch)
	const animStartRef = useRef<number | null>(null)
	const animDuration = CAMERA_PITCH_ANIM_MS // seconds
	const positionedOnceRef = useRef(false)

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
	// Before entering app: set camera once to initial position (no animation)
	useLayoutEffect(() => {
		if (hasEnteredApp || positionedOnceRef.current) return
		const getLocVec = new Geodetic(radians(longitude), radians(latitude)).toECEF()
		locVecRef.current = getLocVec

		new PointOfView(distance, radians(initHeading), radians(recommendedPitch)).decompose(
			getLocVec,
			camera.position,
			camera.quaternion,
			camera.up
		)
		setLocationVector(getLocVec)
		positionedOnceRef.current = true
	}, [hasEnteredApp, longitude, latitude, recommendedPitch, camera, setLocationVector])

	// After entering app: jump immediately on location/weather changes
	useLayoutEffect(() => {
		if (!hasEnteredApp) return
		const getLocVec = new Geodetic(radians(longitude), radians(latitude)).toECEF()
		locVecRef.current = getLocVec

		// keep fromPitchRef so it can animate into place after terrain load
		new PointOfView(distance, radians(initHeading), radians(currentPitchRef.current)).decompose(
			getLocVec,
			camera.position,
			camera.quaternion,
			camera.up
		)

		// set location vector once per location change
		setLocationVector(getLocVec)
	}, [hasEnteredApp, longitude, latitude, recommendedPitch, setLocationVector])

	// Start pitch animation only after terrain has loaded
	useEffect(() => {
		if (!hasEnteredApp) return
		if (phase !== 'animatingCamera') return
		// start pitch animation from current to target
		fromPitchRef.current = currentPitchRef.current
		toPitchRef.current = recommendedPitch
		animStartRef.current = performance.now()
	}, [hasEnteredApp, phase, recommendedPitch])

	// Drive camera pitch animation
	useFrame(() => {
		// Do nothing before entering app (position set once via effect above)
		if (!hasEnteredApp) return
		if (!locVecRef.current) return

		if (animStartRef.current != null) {
			const now = performance.now()
			const t = Math.min(1, (now - animStartRef.current) / (animDuration))
			// easeInOut
			const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
			const pitchDeg = fromPitchRef.current + (toPitchRef.current - fromPitchRef.current) * ease

			new PointOfView(distance, radians(initHeading), radians(pitchDeg)).decompose(
				locVecRef.current,
				camera.position,
				camera.quaternion,
				camera.up
			)

			currentPitchRef.current = pitchDeg
			if (t >= 1) {
				animStartRef.current = null
				currentPitchRef.current = toPitchRef.current
			}
		}
	})

	// Update Camera FOV
	useEffect(() => {
		(camera as PerspectiveCamera).fov = fovValue;
		(camera as PerspectiveCamera).updateProjectionMatrix();

	}, [camera, fovValue]);

	return (null)
}

export default JumpToLocation
