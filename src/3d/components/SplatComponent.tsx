import { Object3DNode, extend } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import { Splat } from '@react-three/drei'

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For typeScript support:
declare module '@react-three/fiber' {
	interface ThreeElements {
		lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
	}
}

export default function SplatComponent() {

	return (
		// <Splat src="GET https://playcanvas.com/api/assets/256b42b8" />


		<lumaSplats
			semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
			source='https://lumalabs.ai/capture/4f362242-ad43-4851-9b04-88adf71f24f5'
			position={[0, 0, 0]}
			scale={1}
		/>
	)
}