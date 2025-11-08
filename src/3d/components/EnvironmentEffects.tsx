import { EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

import { AerialPerspective, Atmosphere } from '@takram/three-atmosphere/r3f'
import { Clouds } from '@takram/three-clouds/r3f'
// import { LensFlare } from '@takram/three-geospatial-effects/r3f'

const EnvironmentEffects = () => {
	return (
		<Atmosphere date={Date.parse('2025-01-01T07:00:00Z')}>
			<EffectComposer multisampling={0} enableNormalPass>
				<Clouds shadow-farScale={0.25} />
				<AerialPerspective sky sunLight skyLight />
				{/* <LensFlare /> */}
				<ToneMapping mode={ToneMappingMode.AGX} />
			</EffectComposer>
		</Atmosphere>
	);
}

export default EnvironmentEffects;
