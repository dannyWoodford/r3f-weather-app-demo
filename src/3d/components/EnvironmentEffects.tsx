import React, { useRef, Fragment, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing'
import {
	ToneMappingMode,
	EffectMaterial,
	type EffectComposer as EffectComposerImpl
} from 'postprocessing'
import {
	AerialPerspective,
} from '@takram/three-atmosphere/r3f'
import {
	type CloudsQualityPreset,
} from '@takram/three-clouds'
import { Clouds } from '@takram/three-clouds/r3f'
import { LensFlare, Dithering, Depth, Normal } from '@takram/three-geospatial-effects/r3f'
import { useControls } from 'leva'

import { useCloudCoverage } from '../../hooks/useCloudCoverage'
import useWeatherStore from '../../store/GlobalState'

const EnvironmentEffects = () => {
	const composerRef = useRef<EffectComposerImpl>(null)

	const defaultToneMappingExposure = 8

	const weatherCode = useWeatherStore((s) => s.data?.now.weatherCode ?? null)

	const defaultCoverage = 0.0;

	// Derive coverage from weather, and whether it's one of the core cloud codes
	const { coverage: coverageFromWeather } = useCloudCoverage(weatherCode, defaultCoverage)

	// coverage will be synced via Leva setter in an effect below
	const cloudsRef = useRef<any>(null)
	const targetCoverageRef = useRef(0)
	const fromCoverageRef = useRef(0)
	const animStartRef = useRef<number | null>(null)

	const [{ enabled, animate, ...cloudsProps }, setClouds] = useControls(
		'clouds',
		() => ({
			enabled: true,
			animate: true,
			coverage: {
				value: defaultCoverage, min: 0, max: 1, step: 0.01,
				onChange: (v: number) => {
					targetCoverageRef.current = v
					fromCoverageRef.current = (cloudsRef.current?.coverage ?? fromCoverageRef.current) as number
					animStartRef.current = performance.now()
				}
			},
			qualityPreset: {
				value: 'low' as const,
				options: [
					'low',
					'medium',
					'high',
					'ultra'
				] satisfies CloudsQualityPreset[]
			}
		}),
		{ collapsed: false }
	)

	// When weather changes, sync GUI once and start animation from 0.0 to target
	useEffect(() => {
		targetCoverageRef.current = coverageFromWeather
		fromCoverageRef.current = 0.0
		animStartRef.current = performance.now()
		setClouds({ coverage: coverageFromWeather })
	}, [coverageFromWeather, setClouds])

	const { correctGeometricError } = useControls(
		'atmosphere',
		{
			correctGeometricError: true,
		},
		{ collapsed: false }
	)

	const camera = useThree(({ camera }) => camera)
	const gl = useThree(({ gl }) => gl)

	const { toneMapping, exposure } = useControls(
		'tone map',
		{
			toneMapping: true,
			exposure: { value: defaultToneMappingExposure, min: 1, max: 60, step: 1 },
		},
		{ collapsed: false }
	)
	const { lensFlare, depth, normal } = useControls(
		'effects',
		{
			lensFlare: false,
			depth: false,
			normal: false
		},
		{ collapsed: false }
	)

	// Effects must know the camera near/far changed by GlobeControls.
	useFrame(() => {
		// Drive Clouds coverage animation imperatively without React updates
		if (animStartRef.current != null && cloudsRef.current) {
			const duration = 3.2 // seconds
			const now = performance.now()
			const elapsed = (now - (animStartRef.current as number)) / 1000
			const t = Math.min(1, elapsed / duration)
			const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
			const value = fromCoverageRef.current + (targetCoverageRef.current - fromCoverageRef.current) * ease
			cloudsRef.current.coverage = value
			if (t >= 1) {
				animStartRef.current = null
				cloudsRef.current.coverage = targetCoverageRef.current
			}
		}

		const composer = composerRef.current
		if (composer != null) {
			composer.passes.forEach(pass => {
				if (pass.fullscreenMaterial instanceof EffectMaterial) {
					pass.fullscreenMaterial.adoptCameraSettings(camera)
				}
			})
		}
	})

	// Update Renderer Tone Mapping Exposure
	useEffect(() => {
		gl.toneMappingExposure = exposure;
	}, [gl, exposure]);

	return (
		<EffectComposer
			ref={composerRef}
			multisampling={0}
			enableNormalPass
		>
			<Fragment
				// Effects are order-dependant; we need to reconstruct the nodes.
				key={JSON.stringify([
					correctGeometricError,
					lensFlare,
					normal,
					depth,
					enabled
				])}
			>
				{!normal && !depth && (
					<>
						{enabled && (
							<Clouds
								localWeatherVelocity={animate ? [0.001, 0] : [0, 0]}
								shadow-farScale={0.25}
								ref={cloudsRef}
								{...cloudsProps}
							/>
						)}
						<AerialPerspective
							sky
							sunLight
							skyLight
							correctGeometricError={correctGeometricError}
							albedoScale={2 / Math.PI}
						/>
					</>
				)}
				{toneMapping && (
					<>
						{lensFlare && <LensFlare />}
						{depth && <Depth useTurbo />}
						{normal && <Normal />}
						{!normal && !depth && (
							<>
								<ToneMapping mode={ToneMappingMode.LINEAR} />
								<SMAA />
								<Dithering />
							</>
						)}
					</>
				)}
			</Fragment>
		</EffectComposer>
	)
}

export default EnvironmentEffects
