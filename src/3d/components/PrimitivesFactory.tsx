import { useEffect, useMemo, useRef } from 'react'
import { Group } from 'three'

import useOutlinerStore, { OutlinerItem } from '../../store/GlobalState'
import TransformGizmo from './TransformGizmo'
import PrimitiveShape from './PrimitiveShape'

export default function PrimitivesFactory() {
	const outlinerItems = useOutlinerStore(s => s.outlinerItems)
	const transformSelected = useOutlinerStore(s => s.transformSelected)

	// Root group for top-level parenting; register into sceneHierarchy under reserved key 'root'.
	// This root acts as the identity parent for depth-0 items. Stored matrices are
	// local-to-parent; world transforms are derived via parent.matrixWorld * local.
	const rootGroupRef = useRef<Group>(null!)

	useEffect(() => {
		if (!rootGroupRef.current) return
		useOutlinerStore.getState().registerHierarchyGroup('root', rootGroupRef.current)

		rootGroupRef.current.updateMatrixWorld(true)
		return () => {
			useOutlinerStore.getState().unregisterHierarchyGroup('root')
		}
	}, [])

	const renderedTree = useMemo(() => {
		// Declaratively render the scene graph by nesting `PrimitiveShape` components.
		// This keeps parenting in sync with the outliner tree. The memo ensures the JSX
		// tree is rebuilt only when `outlinerItems` changes.
		const render = (items: OutlinerItem[], depth: number): any => {
			return items.map(item => (
				<PrimitiveShape key={item.id} item={item} depth={depth}>
					{item.children && item.children.length > 0 ? render(item.children, depth + 1) : null}
				</PrimitiveShape>
			))
		}
		
		const tree = render(outlinerItems, 0)

		return tree
	}, [outlinerItems])

	return (
		<>
			<group ref={rootGroupRef} name='rootGroup'>
				{renderedTree}
			</group>
			<TransformGizmo object={transformSelected ?? undefined} />
		</>
	)
}

