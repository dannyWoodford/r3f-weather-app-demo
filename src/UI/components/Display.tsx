const Display = () => {
	return (
		<section className='weather-overlay' aria-label='Weather overlay'>
			<div className='weather-overlay__content'>
				<header className='weather-header card card--glass'>
					<div className='weather-header__location'>San Francisco, CA</div>
					<time className='weather-header__time'>Fri 3:15 PM</time>
				</header>

				<main className='weather-main card card--glass'>
					<div className='weather-main__temp'>72°</div>
					<div className='weather-main__condition'>Sunny</div>
				</main>

				<section className='weather-details card card--glass' aria-label='Current conditions'>
					<div className='weather-details__item'>High: 75°</div>
					<div className='weather-details__item'>Low: 58°</div>
					<div className='weather-details__item'>Humidity: 42%</div>
					<div className='weather-details__item'>Wind: 6 mph NW</div>
				</section>
			</div>
		</section>
	)
}

export default Display
