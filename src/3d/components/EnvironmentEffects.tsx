import React, { useRef, Fragment } from 'react'

import { useFrame, useThree } from '@react-three/fiber'

import { EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing'

import {
	ToneMappingMode,
	EffectMaterial,
	type EffectComposer as EffectComposerImpl
} from 'postprocessing'

import {
  AerialPerspective,
  Atmosphere,
  type AtmosphereApi,
} from '@takram/three-atmosphere/r3f'
import {
	type CloudsQualityPreset,
} from '@takram/three-clouds'
import { Clouds } from '@takram/three-clouds/r3f'
import { LensFlare, Dithering } from '@takram/three-geospatial-effects/r3f'

import { useControls } from 'leva'


const EnvironmentEffects = () => {
	const atmosphereRef = useRef<AtmosphereApi>(null)
	const composerRef = useRef<EffectComposerImpl>(null)
	
	const defaultCoverage = 0.3
	
  const camera = useThree(({ camera }) => camera)
	
	const { toneMapping } = useControls(
		'tone map',
		{
			toneMapping: true
		},
		{ collapsed: false }
	)
	const { lensFlare } = useControls(
		'effects',
		{
			lensFlare: true,
		},
		{ collapsed: false }
	)
	const { enabled, animate, ...cloudsProps } = useControls(
		'clouds',
		{
			enabled: true,
			animate: true,
			coverage: { value: defaultCoverage ?? 0.3, min: 0, max: 1, step: 0.01 },
			qualityPreset: {
				value: 'high' as const,
				options: [
					'low',
					'medium',
					'high',
					'ultra'
				] satisfies CloudsQualityPreset[]
			}
		},
		{ collapsed: false }
	)
	const { correctAltitude, correctGeometricError, sky, sunLight, skyLight, transmittance, inscatter } = useControls(
		'atmosphere',
		{
			correctAltitude: true,
			correctGeometricError: true,
			sky: true,
			sunLight: true,
			skyLight: true,
			transmittance: true,
			inscatter: true
		},
		{ collapsed: false }
	)

	// Effects must know the camera near/far changed by GlobeControls.
	useFrame(() => {
		const composer = composerRef.current
		if (composer != null) {
			composer.passes.forEach(pass => {
				if (pass.fullscreenMaterial instanceof EffectMaterial) {
					pass.fullscreenMaterial.adoptCameraSettings(camera)
				}
			})
		}
	})

	// useFrame(() => {
	// 	atmosphereRef.current?.updateByDate(new Date())
	// })

  return (
    <Atmosphere
      ref={atmosphereRef}
      correctAltitude={correctAltitude}
      date={Date.parse('2025-11-08T15:00:00Z')}
			// date={Date.parse('2025-01-01T09:00:00Z')}
    >
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
						enabled,
						sky,
						sunLight,
						skyLight,
						transmittance,
						inscatter
					])}
				>
						<>
						{enabled && (
								<Clouds
									shadow-farScale={0.25}
									localWeatherVelocity={ animate ? [0.001, 0] : [0, 0]}
									{...cloudsProps}
								/>
							)}
							<AerialPerspective
								sky={sky}
								sunLight={sunLight}
								skyLight={skyLight}
								transmittance={transmittance}
								inscatter={inscatter}
								correctGeometricError={correctGeometricError}
								albedoScale={2 / Math.PI}
							/>
						</>
						<>
							{lensFlare && <LensFlare />}
						</>
						<>
							{toneMapping && (
								<>
									<ToneMapping mode={ToneMappingMode.AGX} />
									<SMAA />
									<Dithering />
								</>
							)}
						</>
				</Fragment>
      </EffectComposer>
    </Atmosphere>
  )
}

export default EnvironmentEffects
