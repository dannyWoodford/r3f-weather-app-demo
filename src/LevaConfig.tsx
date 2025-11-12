import { useCallback, useState } from 'react'
import { Leva } from 'leva'
import { styled } from 'leva/plugin'

import useWeatherStore from './store/GlobalState'

export const Button = styled('button', {
	display: 'block',
	$reset: '',
	fontWeight: '$button',
	height: '$rowHeight',
	borderStyle: 'none',
	borderRadius: '$sm',
	backgroundColor: '$elevation1',
	color: '$highlight1',
	'&:not(:disabled)': {
		color: '$highlight3',
		backgroundColor: '$elevation3',
		cursor: 'pointer',
		$hover: '$accent3',
		$active: '$accent3 $accent1',
		$focus: ''
	}
})

const LevaConfig = () => {
	const hasEnteredApp = useWeatherStore(s => s.hasEnteredApp)

	const [expanded, setExpanded] = useState(false)
	const handleExpand = useCallback(() => {
		setExpanded(value => !value)
	}, [])

	return (
		<Leva
			collapsed={true}
			hidden={!hasEnteredApp}
			theme={{
				...(expanded && {
					sizes: {
						rootWidth: '420px'
					}
				})
			}}
			titleBar={{
				title: (
					<Button onClick={handleExpand}>
						{expanded ? '→ narrow ←' : '← wide →'}
					</Button>
				)
			}}
		/>
	);
}

export default LevaConfig;
