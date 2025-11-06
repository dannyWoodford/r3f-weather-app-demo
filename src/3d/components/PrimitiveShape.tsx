import { useMemo, useState, useRef, useEffect, useLayoutEffect, memo } from 'react'
import type { ReactNode } from 'react'
import { Outlines } from '@react-three/drei'
// import * as THREE from 'three'
import * as THREE from 'three/webgpu'
import useOutlinerStore, { OutlinerItem } from '../../store/GlobalState'

// Renders a single primitive. The group's transform is initialized from the item's
// LOCAL-TO-PARENT matrix (not world). We decompose once on mount so TransformControls
// can operate with matrixAutoUpdate=true.
function PrimitiveShapeComponent({ item, depth, children }: { item: OutlinerItem; depth: number; children?: ReactNode }) {
	const selectedItem = useOutlinerStore(s => s.selectedItem)
	const setSelectedItem = useOutlinerStore(s => s.setSelectedItem)
	const hoveredItem = useOutlinerStore(s => s.hoveredItem)
	const setHoveredItem = useOutlinerStore(s => s.setHoveredItem)
	const transformSelected = useOutlinerStore(s => s.transformSelected)
	const setTransformSelected = useOutlinerStore(s => s.setTransformSelected)
	const [localHovered, setLocalHovered] = useState(false)

	const groupRef = useRef<THREE.Group>(null!);

	const isSelected = selectedItem === item.id
	const isHovered = hoveredItem === item.id || localHovered

	// If an item is selected from the Sidebar, ensure transformSelected points at this group's node
	useEffect(() => {
		if (!isSelected || !groupRef.current) return
		if (transformSelected !== groupRef.current) {
			setTransformSelected(groupRef.current)
		}
	}, [isSelected, transformSelected, setTransformSelected])

	// Register this Group in the runtime registry on mount; cleanup on unmount
	useEffect(() => {
		if (!groupRef.current) return
		// Access zustand store directly (no subscription, no rerender)
		useOutlinerStore.getState().registerHierarchyGroup(item.id, groupRef.current)
		return () => {
			useOutlinerStore.getState().unregisterHierarchyGroup(item.id)
		}
	}, [item.id])

	// Initialize group's transform from the item's local-to-parent matrix once on mount
	useLayoutEffect(() => {
		if (!groupRef.current) return

		if (item.matrix && item.matrix.length === 16) {
			const m = new THREE.Matrix4().fromArray(item.matrix)
			m.decompose(groupRef.current.position, groupRef.current.quaternion, groupRef.current.scale)
			groupRef.current.updateMatrixWorld(true)
		}
	}, [])

	// Color based on nesting depth - memoized to ensure it updates when depth changes
	const materialColor = useMemo(() => {
		switch (depth) {
			case 0: return '#00ff00' // Green for top level
			case 1: return '#ff8000' // Orange for first level children
			case 2: return '#ff0000' // Red for second level children
			default: return '#888888' // Gray for deeper nesting
		}
	}, [depth])

	// Geometry based on type
	const getGeometry = (type: string) => {
		switch (type) {
			case 'box':
				return new THREE.BoxGeometry(1, 1, 1)
			case 'sphere':
				return new THREE.SphereGeometry(0.5, 32, 32)
			case 'cone':
				return new THREE.ConeGeometry(0.5, 1, 32)
			case 'torus':
				return new THREE.TorusGeometry(0.5, 0.2, 16, 100)
			case 'cylinder':
				return new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
			default:
				return new THREE.BoxGeometry(1, 1, 1)
		}
	}

	const handleClick = (e: any) => {
		e.stopPropagation()
		const nextSelected = isSelected ? null : item.id
		setSelectedItem(nextSelected)
		setTransformSelected(nextSelected ? groupRef.current : null)
	}

	return (
		<group ref={groupRef} name={item.id}>
			<mesh
				key={item.id}
				castShadow
				receiveShadow
				onClick={handleClick}
				onPointerOver={(e) => {
					e.stopPropagation()

					setLocalHovered(true)
					setHoveredItem(item.id)
				}}
				onPointerOut={() => {
					setLocalHovered(false)
					setHoveredItem(null)
				}}
			>
				<primitive object={getGeometry(item.type)} />
				<meshPhysicalMaterial color={materialColor} />

				{/* Show outlines on hover or selection */}
				{/* {(isHovered || isSelected) && (
					<Outlines
						thickness={isSelected ? 4 : 2}
						color="white"
						opacity={isSelected ? 1 : 0.5}
						transparent={true}
					/>
				)} */}
			</mesh>
			{children}
		</group>
	)
}

const PrimitiveShape = memo(
	PrimitiveShapeComponent,
	(prev, next) => {
		// Avoid re-render if id and depth are unchanged and children identity is stable
		return (
			prev.item.id === next.item.id &&
			prev.depth === next.depth &&
			prev.children === next.children
		)
	}
)

export default PrimitiveShape