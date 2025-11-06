import { TransformControls } from '@react-three/drei'
import { Group } from 'three'
import { folder, useControls } from 'leva'
import useOutlinerStore from '../../store/GlobalState'
import { buildMatrix } from '../../utils/helpers'

const modeOptions = ['translate', 'rotate', 'scale'] as const

type Props = {
	object?: Group
}

export default function TransformGizmo({ object }: Props) {
	const selectedId = useOutlinerStore(s => s.selectedItem)
	const { mode, visible } = useControls({
		'﻿TransformControls': folder({
			visible: { value: true },
			mode: { value: 'translate', options: modeOptions },
		}, { collapsed: true })
	})

	if (!visible || !object) return null

	return (
		<TransformControls
			object={object}
			mode={mode as (typeof modeOptions)[number]}
			onMouseUp={() => {
				// Persist the group's local transform to the store as a matrix
				if (!selectedId) return
				const matrix = buildMatrix(
					{ x: object.position.x, y: object.position.y, z: object.position.z },
					{ x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
					{ x: object.scale.x, y: object.scale.y, z: object.scale.z }
				)
				useOutlinerStore.getState().setTransformGroupMatrix(selectedId, matrix)
			}}
		/>
	)
}


