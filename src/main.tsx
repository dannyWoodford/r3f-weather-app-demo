import React from 'react'
import ReactDOM from 'react-dom/client'

import './main.scss'

import App from './App'

function Main() {
	return (
		<div className='main'>
			<App />
		</div>
	)
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Main />
	</React.StrictMode>
)
