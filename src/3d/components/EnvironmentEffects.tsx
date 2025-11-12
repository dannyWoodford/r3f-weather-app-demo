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

const EnvironmentEffects = () => {
	const composerRef = useRef<EffectComposerImpl>(null)
	
	const defaultCoverage = 0.3
	const defaultToneMappingExposure = 8
	
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
			lensFlare: true,
			depth: false,
      normal: false
		},
		{ collapsed: false }
	)

	const { enabled, animate, ...cloudsProps } = useControls(
		'clouds',
		{
			enabled: true,
			animate: true,
			coverage: { value: defaultCoverage, min: 0, max: 1, step: 0.01 },
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
	const { correctGeometricError } = useControls(
		'atmosphere',
		{
			correctGeometricError: true,
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
									localWeatherVelocity={ animate ? [0.001, 0] : [0, 0]}
									shadow-farScale={0.25}
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
