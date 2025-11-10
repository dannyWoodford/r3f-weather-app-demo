import React, { useRef, Fragment, useState, Suspense } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

import { EffectComposer, SMAA, ToneMapping } from '@react-three/postprocessing'
import {
	ToneMappingMode,
	EffectMaterial,
	type EffectComposer as EffectComposerImpl
} from 'postprocessing'
// import { EffectComposer } from '../helpers/EffectComposer'

import {
  AerialPerspective,
  Atmosphere,
  type AtmosphereApi,
} from '@takram/three-atmosphere/r3f'
import {
	type CloudsQualityPreset,
	type CloudsEffect,
} from '@takram/three-clouds'
import { Clouds } from '@takram/three-clouds/r3f'
import { LensFlare, Dithering, Depth, Normal } from '@takram/three-geospatial-effects/r3f'

import { useControls } from 'leva'
import { usePovControls } from '../helpers/usePovControls'

import TilesRendererComponent from './TilesRendererComponent'
import GlobeCamera from './GlobeCamera'

import CloudText from './text/CloudText'


const EnvironmentEffects = () => {
	const atmosphereRef = useRef<AtmosphereApi>(null)
	const composerRef = useRef<EffectComposerImpl>(null)
	
	const defaultCoverage = 0.3
	
  const camera = useThree(({ camera }) => camera)
	usePovControls(camera, { collapsed: true })

	const { toneMapping } = useControls(
		'tone map',
		{
			toneMapping: true
		},
		{ collapsed: false }
	)
	const { lensFlare, depth, normal } = useControls(
		'effects',
		{
			lensFlare: true,
			depth: false,
      normal: false
		},
		{ collapsed: false }
	)

	const [clouds, setClouds] = useState<CloudsEffect | null>(null)
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
	const { correctAltitude, correctGeometricError, sky, sunLight, skyLight, } = useControls(
		'atmosphere',
		{
			correctAltitude: true,
			correctGeometricError: true,
			sky: true,
			sunLight: true,
			skyLight: true,
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

	const date = Date.parse('2025-11-08T15:00:00Z')

	useFrame(() => {
		const atmosphere = atmosphereRef.current;
		if (atmosphere == null) {
			return;
		}
		atmosphere.updateByDate(date);
	});

  return (
    <Atmosphere
      ref={atmosphereRef}
			correctAltitude={correctAltitude}
      // date={Date.parse('2025-11-08T15:00:00Z')}
    >
			<TilesRendererComponent />
			<GlobeCamera />

			<Suspense fallback={null}>
				<CloudText />
			</Suspense>

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
						enabled,
						sky,
						sunLight,
						skyLight,
					])}
				>
          {!normal && !depth && (
            <>
              {enabled && (
                <Clouds
                  ref={setClouds}
									localWeatherVelocity={ animate ? [0.001, 0] : [0, 0]}
									shadow-farScale={0.25}
									{...cloudsProps}
                />
              )}
              <AerialPerspective
								sky={sky}
								sunLight={sunLight}
								skyLight={skyLight}
                correctGeometricError={correctGeometricError}
                albedoScale={1 / Math.PI}
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
									<ToneMapping mode={ToneMappingMode.AGX} />
                  <SMAA />
                  <Dithering />
                </>
              )}
            </>
          )}
				</Fragment>
      </EffectComposer>
    </Atmosphere>
  )
}

export default EnvironmentEffects
