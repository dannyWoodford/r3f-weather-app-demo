import { create } from 'zustand'
import { Group, Matrix4 } from 'three'
import { buildMatrix } from '../utils/helpers'
import type { PrimitiveType } from '../utils/types'

export type OutlinerItem = {
	id: string;
	name: string;
	type: PrimitiveType;
	// Local-to-parent transform matrix (Matrix4 elements). This is NOT a world matrix.
	// The value represents TRS relative to the item's immediate parent in the scene graph.
	matrix: number[];
	children: OutlinerItem[];
};

// Seed data: All matrices below are LOCAL-TO-PARENT. Root-level items are local to the
// invisible root group (identity). A child's world transform is derived via parent * local.
export const outlinerData: OutlinerItem[] = [
	{
		id: "1",
		name: "Box 1",
		type: "box",
		matrix: buildMatrix([-2, 0, -2]),
		children: []
	},
	{
		id: "7",
		name: "Cone 1",
		type: "cone",
		matrix: buildMatrix([0, 0, -2]),
		children: [
			{
				id: "13",
				name: "Torus 1",
				type: "torus",
				matrix: buildMatrix([2, 0, 0]),
				children: []
			},
		]
	},
	{
		id: "12",
		name: "Cone 2",
		type: "cone",
		matrix: buildMatrix([-2, 0, 0]),
		children: [
			{
				id: "14",
				name: "Torus 2",
				type: "torus",
				matrix: buildMatrix([2, 0, 0]),
				children: []
			},
			{
				id: "15",
				name: "Torus 3",
				type: "torus",
				matrix: buildMatrix([4, 0, 0]),
				children: [
					{
						id: "15-1",
						name: "Sphere 1",
						type: "sphere",
						matrix: buildMatrix([-4, 0, 2]),
						children: []
					},
					{
						id: "15-2",
						name: "Cylinder 1",
						type: "cylinder",
						matrix: buildMatrix([-2, 0, 2]),
						children: []
					},
				],
			},
			{
				id: "16",
				name: "Cylinder 2",
				type: "cylinder",
				matrix: buildMatrix([4, 0, 2]),
				children: []
			},
		],
	},
];

interface OutlinerStore {
	outlinerItems: OutlinerItem[]
	addItem: (parentId: string | null, newItem: Omit<OutlinerItem, 'id'>) => void
	deleteItem: (id: string) => void
	moveItem: (dragId: string, newParentId: string | null, newIndex: number) => void
	renameItem: (id: string, newName: string) => void
	setTransformGroupMatrix: (id: string, matrix: number[]) => void
	searchTerm: string
	setSearchTerm: (term: string) => void
	selectedItem: string | null
	setSelectedItem: (id: string | null) => void
	transformSelected: Group | null
	setTransformSelected: (mesh: Group | null) => void
	hoveredItem: string | null
	setHoveredItem: (id: string | null) => void
	sceneHierarchy: Record<string, Group>
	registerHierarchyGroup: (id: string, node: Group) => void
	unregisterHierarchyGroup: (id: string) => void
}

// Centralized state shared by the Outliner (React Arborist) and the 3D scene.
// We keep this as the single source of truth. UI events (add/delete/move)
// mutate this store so both views stay in sync.
const useOutlinerStore = create<OutlinerStore>((set, get) => ({
	outlinerItems: outlinerData,
	searchTerm: '',
	selectedItem: null,
	transformSelected: null,
	hoveredItem: null,
	sceneHierarchy: {},
	setSearchTerm: (term) => set({ searchTerm: term }),
	setSelectedItem: (id) => set({ selectedItem: id, ...(id === null ? { transformSelected: null } : {}) }),
	setTransformSelected: (mesh) => set({ transformSelected: mesh }),
	setHoveredItem: (id) => set({ hoveredItem: id }),
	setTransformGroupMatrix: (id, matrix) => set((state) => {
		const updateRecursive = (items: OutlinerItem[]): OutlinerItem[] => {
			return items.map(item => {
				const children = item.children && item.children.length > 0 ? updateRecursive(item.children) : []
				if (item.id === id) {
					return { ...item, matrix: [...matrix], children }
				}
				return { ...item, children }
			})
		}
		return { outlinerItems: updateRecursive(state.outlinerItems) }
	}),
	registerHierarchyGroup: (id, node) => set((state) => ({ sceneHierarchy: { ...state.sceneHierarchy, [id]: node } })),
	unregisterHierarchyGroup: (id) => set((state) => {
		if (!(id in state.sceneHierarchy)) return {}
		const { [id]: _removed, ...rest } = state.sceneHierarchy
		return { sceneHierarchy: rest }
	}),
	addItem: (_parentId, newItem) => set((state) => {
		const newId = Date.now().toString()
		const itemWithId = { ...newItem, id: newId }
		return { outlinerItems: [...state.outlinerItems, itemWithId] }
	}),
	// Rename an item by id (immutable deep update)
	renameItem: (id, newName) => set((state) => {
		const renameRecursive = (items: OutlinerItem[]): OutlinerItem[] => {
			return items.map(item => {
				const children = item.children && item.children.length > 0
					? renameRecursive(item.children)
					: []
				if (item.id === id) {
					return { ...item, name: newName, children }
				}
				return { ...item, children }
			})
		}
		return { outlinerItems: renameRecursive(state.outlinerItems) }
	}),
	// Remove an item (and its descendants) from any depth by id
	deleteItem: (id) => set((state) => {
		const deleteRecursive = (items: OutlinerItem[]): OutlinerItem[] => {
			return items
				.filter(item => item.id !== id)
				.map(item => ({
					...item,
					children: item.children ? deleteRecursive(item.children) : []
				}))
		}
		return { outlinerItems: deleteRecursive(state.outlinerItems) }
	}),
	// Move a node by id to a new parent/index within the tree.
	// Handles:
	// - Reordering among root siblings (newParentId === null)
	// - Moving from root into a folder
	// - Moving between folders
	// - Reordering within the same folder (with index compensation)
	//
	// Rationale (controlled Tree):
	// React Arborist emits onMove with { dragIds, parentId, index } but in controlled mode
	// the data source is our store. We therefore apply the mutation here and pass the
	// updated data back to <Tree data={outlinerItems}>, keeping the Outliner and 3D scene
	// synchronized via a single source of truth.
	//
	// Algorithm overview:
	// 1) extractNodeFromTree: Create a new tree with the dragged node removed, and return
	//    the node plus its original parent/id and index. This is done immutably.
	// 2) Same-parent compensation: If moving within the same parent and the original index
	//    was before the new index, decrement the target index since the removal shifts the
	//    target position left by one.
	// 3) insertNodeFromTree: Insert the node into the new parent/index, producing a new
	//    tree structure without mutating the originals.
	moveItem: (dragId, newParentId, newIndex) => set((state) => {
		const rootItems = state.outlinerItems;

		// Recursively extract the node, returning the pruned items and the removed node.
		// Also includes the source parent and index for same-parent index adjustment.
		type RemoveResult = {
			items: OutlinerItem[];
			node: OutlinerItem | null;
			fromParentId: string | null;
			fromIndex: number;
		};

		const extractNodeFromTree = (items: OutlinerItem[], parentId: string | null = null): RemoveResult => {
			const newItems: OutlinerItem[] = [];
			let foundNode: OutlinerItem | null = null;
			let foundIndex: number = -1;
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.id === dragId) {
					foundNode = item;
					foundIndex = i;
					continue; // skip adding this item to newItems (effectively removing it)
				}
				if (item.children && item.children.length > 0) {
					const childResult = extractNodeFromTree(item.children, item.id);
					if (childResult.node) {
						// We removed from a descendant; update this item's children with the result
						newItems.push({ ...item, children: childResult.items });
						return {
							items: [...newItems, ...items.slice(i + 1)],
							node: childResult.node,
							fromParentId: childResult.fromParentId,
							fromIndex: childResult.fromIndex,
						};
					}
					newItems.push(item);
				} else {
					newItems.push(item);
				}
			}
			if (foundNode) {
				return { items: newItems, node: foundNode, fromParentId: parentId, fromIndex: foundIndex };
			}
			return { items: newItems, node: null, fromParentId: parentId, fromIndex: -1 };
		};

		// Insert the node under parentId at index. If parentId is null, insert at the root.
		// Always returns new arrays/objects (immutability) to ensure predictable React re-renders.
		const insertNodeFromTree = (items: OutlinerItem[], parentId: string | null, index: number, node: OutlinerItem): OutlinerItem[] => {
			if (parentId === null) {
				const newRoot = [...items];
				const clampedIndex = Math.max(0, Math.min(index, newRoot.length));
				newRoot.splice(clampedIndex, 0, node);
				return newRoot;
			}
			return items.map((item) => {
				if (item.id === parentId) {
					const children = item.children ? [...item.children] : [];
					const clampedIndex = Math.max(0, Math.min(index, children.length));
					children.splice(clampedIndex, 0, node);
					return { ...item, children };
				}
				if (item.children && item.children.length > 0) {
					return { ...item, children: insertNodeFromTree(item.children, parentId, index, node) };
				}
				return item;
			});
		};

		const removed = extractNodeFromTree(rootItems, null);
		if (!removed.node) {
			return { outlinerItems: rootItems };
		}

		let targetIndex = newIndex;
		const fromPid = removed.fromParentId;
		// Same-parent compensation: removing the node shifts items to the left. If the
		// node originated before the intended target index, decrement by 1 so the final
		// position matches the user's drop location.
		if ((fromPid ?? null) === (newParentId ?? null) && removed.fromIndex > -1 && removed.fromIndex < newIndex) {
			targetIndex = newIndex - 1;
		}


		// Compute world-preserving local matrix relative to the intended new parent,
		// and apply it to both the data model and the live object (if present).
		try {
			const registry = get().sceneHierarchy
			const child = registry[dragId]
			const parentNode = (newParentId ? registry[newParentId] : registry['root'])
			if (child && parentNode) {
				parentNode.updateWorldMatrix(true, false)
				child.updateWorldMatrix(true, false)
				const invParent = new Matrix4().copy(parentNode.matrixWorld).invert()
				const local = new Matrix4().multiplyMatrices(invParent, child.matrixWorld)
				// Apply to live object immediately to avoid visual jump during React reparenting
				local.decompose(child.position, child.quaternion, child.scale)
				child.updateMatrixWorld(true)
				// Persist into the moved node's matrix
				removed.node = { ...removed.node, matrix: local.toArray() }
			}
		} catch { }

		const inserted = insertNodeFromTree(removed.items, newParentId, targetIndex, removed.node);
		return { outlinerItems: inserted };
	}),
}))

export default useOutlinerStore