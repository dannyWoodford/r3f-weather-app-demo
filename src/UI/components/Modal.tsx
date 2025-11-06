import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from '../styles/Modal.module.css'

export type ModalProps = {
	isOpen: boolean
	onClose: () => void
	title?: string
	children?: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
	useEffect(() => {
		if (!isOpen) return
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, onClose])

	if (!isOpen) return null

	return createPortal(
		<div className={styles.overlay} onClick={onClose}>
			<div
				className={styles.dialog}
				onClick={(e) => e.stopPropagation()}
				role='dialog'
				aria-modal='true'
			>
				<div className={styles.header}>
					<div className={styles.title}>{title}</div>
					<button className={styles.closeButton} onClick={onClose} aria-label='Close'>
						×
					</button>
				</div>
				<div className={styles.body}>{children}</div>
			</div>
		</div>,
		document.body
	)
}


