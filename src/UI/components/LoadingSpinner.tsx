import React, { memo } from 'react'

type LoadingSpinnerProps = {
	visible?: boolean
	label?: string
	overlay?: boolean
	size?: number
	color?: string
	background?: string
	zIndex?: number
	className?: string
	style?: React.CSSProperties
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	visible = true,
	label,
	overlay = false,
	size = 164,
	color,
	background = 'rgba(0,0,0,0.3)',
	zIndex = 21,
	className,
	style,
}) => {
	if (!visible) return null

	const resolvedColor = color ?? (overlay ? '#ffffff' : '#999999')

	const containerStyle: React.CSSProperties = overlay
		? {
			position: 'fixed',
			inset: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background,
			// backdropFilter: 'blur(4px) saturate(125%)',
			// WebkitBackdropFilter: 'blur(4px) saturate(125%)',
			zIndex,

			pointerEvents: 'all',
			...style,
		}
		: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			...style,
		}

	const labelStyle: React.CSSProperties = {
		marginTop: 8,
		fontSize: 12,
		color: resolvedColor,
		opacity: 0.9,
		textAlign: 'center',
	}

	const strokeWidth = Math.max(2, Math.floor(size * 0.08))
	const radius = (size - strokeWidth) / 2
	const center = size / 2

	return (
		<div id="spinner" className={className} style={containerStyle}>
			<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					role="status"
					aria-label={label ?? 'Loading'}
				>
					<circle
						cx={center}
						cy={center}
						r={radius}
						fill="none"
						stroke={resolvedColor}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={Math.PI * radius}
						strokeDashoffset={Math.PI * radius * 0.75}
						opacity={0.8}
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							from={`0 ${center} ${center}`}
							to={`360 ${center} ${center}`}
							dur="1s"
							repeatCount="indefinite"
						/>
					</circle>
				</svg>
				{label && <div style={labelStyle}>{label}</div>}
			</div>
		</div>
	)
}

export default memo(LoadingSpinner)


