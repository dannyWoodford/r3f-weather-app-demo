# R3F Weather Demo (Frog Prototyping Exercise)



**Demo**: https://r3f-weather-app-demo.web.app

## Caveats

- Cesium ion token required: set `VITE_ION_KEY` in your environment for tiles to load.
- Performance: 
Volumetric effects and 3D tiles are GPU‑intensive; desktop Chrome is recommended. If performance allows, set Cloud quality to “high” or “ultra” to enable volumetric light, and optionally enable “Lens Flare” in the Leva Effects panel.
- Prototype quality: Not production‑ready; requires performance tuning and feature work. Possible improvements include using the weather API data to be reflected in the 3D atmosphere by setting accurate sunrise/sunset, and potentially rain/snow shaders based on location.

## Features


- Interactive 3D globe with streamed 3D Tiles terrain (Cesium ion) using NASA AMMOS 3D Tiles Renderer and `three-geospatial` to render the Clouds, Atmosphere, and Effects .
  - Smooth pan/orbit/zoom with `GlobeControls`
  - Camera “jump to location” based on selected lat/lon

- Location search and geocoding
  - Search locations via Open‑Meteo Geocoding API
  - “Use my location” with HTML5 Geolocation

- Live weather data
  - Open‑Meteo forecast with automatic timezone
  - “Now” snapshot and hourly series: temperature, humidity, wind, weather codes

- Weather UI overlay
  - Temperature card with °F/°C toggle
  - Humidity and wind speed
  - Local time for the selected location

- 3D atmosphere and visual effects (`three-geospatial`)
  - Physically‑based atmosphere and aerial perspective
  - Volumetric clouds with quality presets; optional lens flare/depth/normal debug
  - Postprocessing: tone mapping, SMAA, dithering
  
- Display Weather Codes in 3D space
  - Weather‑driven “cloud text” particle effect positioned near the location

- Performance and architecture
  - Progressive 3D Tiles streaming with Draco compression and fade transitions
  - Worker‑thread creased normal generation for tiles
  - State via Zustand; developer controls via Leva; Vite + R3F stack

## Globe Controls

- Change location
  - Use the top-left search (after entering) or the onboarding search to jump the globe to a city.
  - Or click “Use my location” to center the globe on your current position.

- Mouse/trackpad
  - Left-drag: pan across the globe
  - Right-drag (or Ctrl/Cmd + drag): rotate/orbit the view
  - Scroll/trackpad pinch: zoom in/out


## 🕹️ Running Locally

- For Cesium 3D Tiles to load, a Cesium ion access token is required.
  - Create a ".env" file at the project root and add this variable (replacing `YOUR_CESIUM_ION_ACCESS_TOKEN` with your token):

    ```dotenv
    VITE_ION_KEY=YOUR_CESIUM_ION_ACCESS_TOKEN
    ```
  - <sub>Do not commit access tokens; leaked tokens can be abused.</sub>

`npm i --legacy-peer-deps`

Note: The legacy peer deps flag avoids peer dependency conflicts between some Three/R3F ecosystem packages and the stricter npm v7+ resolver.

`npm run dev`


## Credits

- Template: Based on the Vite React Three Fiber (R3F) + TypeScript template. See `pmndrs/react-three-vite` (`https://github.com/pmndrs/react-three-vite`).
- React Three Fiber: `https://github.com/pmndrs/react-three-fiber`
- Zustand: `https://github.com/pmndrs/zustand`
- NASA AMMOS 3d-tiles-renderer: `https://github.com/NASA-AMMOS/3DTilesRendererJS?tab=readme-ov-file`
- three-geospatial: `https://github.com/takram-design-engineering/three-geospatial/tree/main?tab=readme-ov-file`