import React, { useEffect, useRef, useState } from "react";
import {
	CursorProps,
	NodeApi,
	NodeRendererProps,
	Tree,
	TreeApi,
} from "react-arborist";
import { MdAdd, MdArrowDropDown, MdArrowRight } from "react-icons/md";
import { TiDeleteOutline } from "react-icons/ti";
import { buildMatrix } from '../utils/helpers'

import { getIconForType } from "../utils/icons";
import { PRIMITIVE_TYPES } from "../utils/types";
import type { PrimitiveType } from "../utils/types";

import useOutlinerStore, { OutlinerItem } from "../store/GlobalState";
import { FillFlexParent } from "./helpers/fill-flex-parent";

import Modal from "./components/Modal";

import styles from "./styles/Outliner.module.css";
import modalStyles from "./styles/Modal.module.css";


// Outliner sidebar
// Controlled Tree: we pass data from the store and handle all mutations (add/delete/move)
// by updating the store. This keeps React Arborist and the 3D scene in sync.
export default function Sidebar() {
	const outlinerItems = useOutlinerStore(s => s.outlinerItems)
	const searchTerm = useOutlinerStore(s => s.searchTerm)
	const setSearchTerm = useOutlinerStore(s => s.setSearchTerm)
	const selectedItem = useOutlinerStore(s => s.selectedItem)
	const hoveredItem = useOutlinerStore(s => s.hoveredItem)
	const setHoveredItem = useOutlinerStore(s => s.setHoveredItem)
	const addItem = useOutlinerStore(s => s.addItem)
	const moveItem = useOutlinerStore(s => s.moveItem)
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [selectedType, setSelectedType] = useState<PrimitiveType | null>(null);
	const [newPrimitiveName, setNewPrimitiveName] = useState<string>("");
	const [pos, setPos] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
	const [rot, setRot] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

	// Apply isHovered class to the tree row wrapper when hoveredItem changes.
	// Why DOM manipulation?
	// - React Arborist renders each row inside a wrapper element with role="treeitem".
	// - The library exposes selection/focus/drag state, but not an API to set a custom
	//   class on the row wrapper for arbitrary external hover states (e.g. 3D hover).
	// - Newer docs mention row-level customization, but our installed version does not
	//   accept a functional rowClassName in a way that TypeScript/React accepts here.
	// - Our CSS targets the wrapper ([role='treeitem']) for full-row background styles.
	// Therefore, we synchronously add/remove a CSS module class on that wrapper based
	// on our global hoveredItem, which is updated from both sidebar and 3D events.
	useEffect(() => {
		const findItemById = (items: OutlinerItem[], id: string | null): OutlinerItem | null => {
			if (!id) return null;
			for (const it of items) {
				if (it.id === id) return it;
				if (it.children && it.children.length) {
					const found = findItemById(it.children, id);
					if (found) return found;
				}
			}
			return null;
		};
		// First, clear the hover class from all rows
		const allTreeItems = document.querySelectorAll('[role="treeitem"]');
		allTreeItems.forEach((item) => {
			item.classList.remove(styles.isHovered);
			item.classList.remove(styles.canNest);
		});

		// Then, if a node is hovered, add the class to its containing row
		if (hoveredItem) {
			const hoveredNodeElement = document.querySelector(`[data-node-id="${hoveredItem}"]`);
			if (hoveredNodeElement) {
				const treeItem = hoveredNodeElement.closest('[role="treeitem"]');
				if (treeItem) {
					treeItem.classList.add(styles.isHovered);

					const hoveredData = findItemById(outlinerItems, hoveredItem);
					// Only show dashed border if dragging AND the target actually has children
					if (isDragging && hoveredData && Array.isArray(hoveredData.children) && hoveredData.children.length > 0) {
						(treeItem as Element).classList.add(styles.canNest);
					}
				}
			}
		}
	}, [hoveredItem, outlinerItems, isDragging]);

	const treeRef = useRef<TreeApi<OutlinerItem> | null>(null);

	const globalTree = (tree?: TreeApi<OutlinerItem> | null) => {
		// @ts-ignore
		window.tree = tree;
		treeRef.current = tree || null;
	};

	const handleCreate = () => {
		// Defaults when no type is selected
		const typeToUse: PrimitiveType = selectedType ?? 'sphere'
		const name = selectedType ? (newPrimitiveName.trim() || (typeToUse.charAt(0).toUpperCase() + typeToUse.slice(1))) : 'default'

		// Controlled mode: update store; Tree re-renders from data
		addItem(null, {
			name,
			type: typeToUse,
			matrix: buildMatrix(pos, rot),
			children: [],
		});

		setIsAddModalOpen(false);
		setSelectedType(null);
		setNewPrimitiveName("");
		setPos({ x: 0, y: 0, z: 0 })
		setRot({ x: 0, y: 0, z: 0 })
	};

	// React Arborist drag/move callback. We forward the change to the store.
	// args.dragIds: ids being moved (we handle single selection here)
	// args.parentId: target parent id (null means root)
	// args.index: target index within the target parent's children
	const handleMove = (args: { dragIds: string[]; parentId: string | null; index: number }) => {
		const { dragIds, parentId, index } = args;
		const dragId = dragIds[0];
		moveItem(dragId, parentId, index);
		setIsDragging(false);
	};

	return (
		<div className={styles.page}>
			<div className={styles.mainContent}>
				<div className={styles.sidebar}>
					<div className={styles.header}>
						<h1>Outliner</h1>
					</div>
					<div className={styles.search}>
						<h3>Search:</h3>
						<input
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.currentTarget.value)}
						/>
					</div>
					<button className={styles.addPrimitiveButton} onClick={() => setIsAddModalOpen(true)}>
						<MdAdd />
						Add Primitive
					</button>
					<FillFlexParent>
						{({ width, height }) => {
							return (
								<Tree
									ref={globalTree}
									data={outlinerItems}
									width={width}
									height={height}
									rowHeight={32}
									renderCursor={DropCursor}
									searchTerm={searchTerm}
									paddingBottom={32}
									className={styles.tree}
									selection={selectedItem ?? undefined}
									disableDrop={({ parentNode }) => {
										if (!isDragging) setIsDragging(true);
										setHoveredItem(parentNode ? parentNode.data.id : null);
										return false;
									}}
									onMove={handleMove}
								>
									{Node}
								</Tree>
							);
						}}
					</FillFlexParent>
					<div className={styles.content}>
						<h3>Try the following:</h3>
						<ul>
							<li>Drag to move items or reorder hierarchy</li>
							<li>Delete items with <span className={styles.deleteIcon}><TiDeleteOutline /></span> ( or press delete)</li>
							<li>Add primitives with "Add Primitive" button</li>
							<li>Rename (double-click on item)</li>
							<li>Toggle parent items (press spacebar)</li>
						</ul>
					</div>
					<Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={'Add Primitive'}>
						<div className={modalStyles.optionsGrid}>
							{PRIMITIVE_TYPES.map((type) => {
								const TypeIcon = getIconForType(type)
								return (
									<button
										key={type}
										type="button"
										className={[
											modalStyles.optionButton,
											selectedType === type ? modalStyles.selected : ''
										].join(' ')}
										onClick={() => setSelectedType(type)}
									>
										<span className={modalStyles.optionIcon}><TypeIcon /></span>
										<span className={modalStyles.optionLabel}>{type}</span>
									</button>
								)
							})}
						</div>
						<div className={modalStyles.nameRow}>
							<label className={modalStyles.nameLabel} htmlFor="new-primitive-name">Name</label>
							<input
								id="new-primitive-name"
								type="text"
								className={modalStyles.nameInput}
								placeholder="Enter a name"
								value={newPrimitiveName}
								onChange={(e) => setNewPrimitiveName(e.currentTarget.value)}
							/>
						</div>
						<div className={modalStyles.nameRow}>
							<label className={modalStyles.nameLabel}>Position (x, y, z)</label>
							<div className={modalStyles.inputGrid}>
								<input type="number" className={modalStyles.nameInput} value={pos.x} onChange={(e) => setPos(p => ({ ...p, x: Number((e.target as HTMLInputElement).value || '0') }))} />
								<input type="number" className={modalStyles.nameInput} value={pos.y} onChange={(e) => setPos(p => ({ ...p, y: Number((e.target as HTMLInputElement).value || '0') }))} />
								<input type="number" className={modalStyles.nameInput} value={pos.z} onChange={(e) => setPos(p => ({ ...p, z: Number((e.target as HTMLInputElement).value || '0') }))} />
							</div>
						</div>
						<div className={modalStyles.nameRow}>
							<label className={modalStyles.nameLabel}>Rotation (x, y, z)</label>
							<div className={modalStyles.inputGrid}>
								<input type="number" className={modalStyles.nameInput} value={rot.x} onChange={(e) => setRot(r => ({ ...r, x: Number((e.target as HTMLInputElement).value || '0') }))} />
								<input type="number" className={modalStyles.nameInput} value={rot.y} onChange={(e) => setRot(r => ({ ...r, y: Number((e.target as HTMLInputElement).value || '0') }))} />
								<input type="number" className={modalStyles.nameInput} value={rot.z} onChange={(e) => setRot(r => ({ ...r, z: Number((e.target as HTMLInputElement).value || '0') }))} />
							</div>
						</div>
						<div className={modalStyles.footerActions}>
							<button
								type="button"
								className={modalStyles.createButton}
								onClick={handleCreate}
							>
								Create
							</button>
						</div>
					</Modal>
				</div>
			</div>
		</div>
	);
}

function Node({ node, style, dragHandle }: NodeRendererProps<OutlinerItem>) {
	const Icon = getIconForType(node.data.type);
	const { selectedItem, setSelectedItem, setHoveredItem, deleteItem, setTransformSelected } = useOutlinerStore();

	const isSelected = selectedItem === node.data.id;

	const handleDelete = (e: React.MouseEvent) => {
		// Prevent node toggle when clicking delete
		e.stopPropagation();

		// Clear transform selection when deleting an item
		setTransformSelected(null);

		// Store-first delete approach (consistent with adding items):
		// - Update the Zustand store, which serves as the single source of truth
		// - Tree re-renders automatically from the updated outlinerItems data
		// - 3D scene also re-renders from the same store data, keeping both synchronized
		// - This ensures React Arborist's internal state stays consistent with our data
		deleteItem(node.data.id);

		// Clear selection if deleting the currently selected item
		if (isSelected) {
			setSelectedItem(null);
		}
	};

	return (
		<div
			ref={dragHandle}
			style={style}
			className={styles.node}
			data-node-id={node.data.id}
			onClick={(e) => {
				// Don't interfere with drag operations
				if (e.detail === 1) { // Only handle single clicks, not drag-related events
					setSelectedItem(isSelected ? null : node.data.id);
				}
			}}
			onMouseEnter={() => setHoveredItem(node.data.id)}
			onMouseLeave={() => setHoveredItem(null)}
		>
			<FolderArrow node={node} />
			<span>
				<Icon />
			</span>
			<span onDoubleClick={() => node.edit()}>{node.isEditing ? <Input node={node} /> : node.data.name}</span>
			<span
				onClick={(e) => {
					e.stopPropagation(); // Prevent node selection when clicking delete
					e.preventDefault(); // Prevent any drag interference
					handleDelete(e);
				}}
				className={styles.removeNodeButton}
			>
				<TiDeleteOutline />
			</span>
		</div>
	);
}

function Input({ node }: { node: NodeApi<OutlinerItem> }) {
	const { renameItem } = useOutlinerStore();
	return (
		<input
			autoFocus
			type="text"
			defaultValue={node.data.name}
			onFocus={(e) => e.currentTarget.select()}
			onBlur={() => node.reset()}
			onKeyDown={(e) => {
				if (e.key === "Escape") node.reset();
				if (e.key === "Enter") {
					const value = (e.currentTarget as HTMLInputElement).value.trim();
					if (value && value !== node.data.name) {
						renameItem(node.data.id, value);
					}
					node.submit(value || node.data.name);
				}
			}}
		/>
	);
}

function FolderArrow({ node }: { node: NodeApi<OutlinerItem> }) {
	const hasChildren = !!(node.data.children && node.data.children.length > 0);
	if (!hasChildren) return <span></span>;

	const handleNodeToggle = () => {
		if (hasChildren) {
			node.toggle();
		}
	};

	return (
		<span
			onClick={(e) => {
				e.stopPropagation(); // Prevent parent click handlers
				handleNodeToggle();
			}}
		>
			{node.isOpen ? <MdArrowDropDown /> : <MdArrowRight />}
		</span>
	);
}

function DropCursor({ top, left }: CursorProps) {
	return <div className={styles.dropCursor} style={{ top, left }}></div>;
}