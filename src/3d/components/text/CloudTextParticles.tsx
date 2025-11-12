import React, { useEffect, useMemo, useRef } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { InstancedMesh, Object3D } from 'three'
import { useControls } from 'leva'


type CloudTextParticlesProps = {
	// Text to render as clouds
	text?: string
	// Overall scale multiplier applied to the text block
	scale?: number
	// Canvas font family
	fontFamily?: string
	// Canvas font pixel size used for sampling
	fontSizePx?: number
	// Scene units per texture pixel (controls absolute size)
	fontScaleFactor?: number
	// Sampling density: take every Nth pixel in X/Y to reduce instance count
	sampleStep?: number
	// Material opacity
	opacity?: number
}

type Particle = {
	x: number
	y: number
	z: number
	scale: number
	maxScale: number
	deltaScale: number
	age: number
	ageDelta: number
	rotationZ: number
	deltaRotation: number
	isGrowing: boolean
}

const DEFAULT_TEXT = 'FLUFFY'

export default function CloudTextParticles(props: CloudTextParticlesProps) {
	const {
		text = DEFAULT_TEXT,
		scale = 1,
		fontFamily = 'Verdana',
		fontSizePx = 120,
		fontScaleFactor = 0.05,
		sampleStep = 1,
		opacity = 0.7,
	} = props

	const alphaMap = useTexture('/textures/smoke.png')
	const instancedRef = useRef<InstancedMesh>(null)
	const dummy = useMemo(() => new Object3D(), [])
	const camera = useThree(({ camera }) => camera)

	// Derived data for the current text: canvas metrics and particle seeds
	const { particles, sceneWidth, sceneHeight } = useMemo(() => {
		// Prepare canvas
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d', { willReadFrequently: true })
		if (!ctx) {
			return { particles: [] as Particle[], sceneWidth: 0, sceneHeight: 0 }
		}

		const lines = text.split('\n')
		const fontSpec = `100 ${fontSizePx}px ${fontFamily}`
		ctx.font = fontSpec
		ctx.textBaseline = 'alphabetic'

		// Measure dimensions
		const lineHeights = fontSizePx * 1.1
		const canvasWidth =
			Math.max(1, ...lines.map((l) => Math.ceil(ctx.measureText(l).width))) | 0
		const canvasHeight = Math.ceil(lines.length * lineHeights) | 0

		canvas.width = canvasWidth
		canvas.height = canvasHeight

		// Reset font after resizing canvas
		ctx.font = fontSpec
		ctx.fillStyle = '#2a9d8f'
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// Draw lines similar to original baseline offset
		for (let i = 0; i < lines.length; i++) {
			const y = (i + 0.8) * (canvasHeight / lines.length)
			ctx.fillText(lines[i], 0, y)
		}

		// Sample image data into particle seeds
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		const particlesLocal: Particle[] = []
		const sx = Math.max(1, sampleStep | 0)
		const sy = sx

		for (let y = 0; y < canvas.height; y += sy) {
			for (let x = 0; x < canvas.width; x += sx) {
				const idx = (x + y * canvas.width) * 4
				// Use red channel > 0 as mask (matching original)
				if (imageData.data[idx] > 0) {
					// Scene coords
					const px = x * fontScaleFactor
					const py = y * fontScaleFactor
					// Randomized particle params
					const p: Particle = {
						x: px + 0.15 * (Math.random() - 0.5),
						y: py + 0.15 * (Math.random() - 0.5),
						z: 0,
						scale: 0,
						maxScale: 0.1 + 1.5 * Math.pow(Math.random(), 10),
						deltaScale: 0.03 + 0.03 * Math.random(),
						age: Math.PI * Math.random(),
						ageDelta: 0.01 + 0.02 * Math.random(),
						rotationZ: 0.5 * Math.random() * Math.PI,
						deltaRotation: 0.01 * (Math.random() - 0.5),
						isGrowing: true,
					}
					particlesLocal.push(p)
				}
			}
		}

		return {
			particles: particlesLocal,
			sceneWidth: canvasWidth * fontScaleFactor,
			sceneHeight: canvasHeight * fontScaleFactor,
		}
	}, [text, fontFamily, fontSizePx, fontScaleFactor, sampleStep])


	// Animate particle matrices
	const { animate: animateParticles } = useControls(
		'cloud text',
		{
			animate: true,
		}
	)
	
	const animate = () => {
		if (!instancedRef.current) return
		const mesh = instancedRef.current

		// Compute local billboard quaternion that cancels parent rotation
		const parentQuat = new THREE.Quaternion()
		instancedRef.current?.parent?.getWorldQuaternion(parentQuat)
		parentQuat.invert()
		const cameraQuat = camera.quaternion

		let i = 0
		for (const p of particles) {
			// Evolve
			p.age += p.ageDelta
			p.rotationZ += p.deltaRotation
			if (p.isGrowing) {
				p.scale += p.deltaScale
				if (p.scale >= p.maxScale) {
					p.isGrowing = false
				}
			} else {
				p.scale = p.maxScale + 0.3 * Math.sin(p.age)
			}

			// Build matrix: billboard in world space (counteract parent rotation), then gentle spin
			dummy.quaternion.copy(cameraQuat).premultiply(parentQuat)
			dummy.rotateZ(p.rotationZ)
			dummy.position.set(p.x, sceneHeight - p.y, p.z)
			dummy.scale.set(p.scale, p.scale, p.scale)
			dummy.updateMatrix()
			mesh.setMatrixAt(i++, dummy.matrix)
		}
		mesh.instanceMatrix.needsUpdate = true
	}
	useFrame(() => {
		if (animateParticles) {
			animate()
		} 
	})

	// Anchor: center the text block and account for the component scale
	const anchorPosition = useMemo(() => {
		return new THREE.Vector3(-0.5 * sceneWidth * scale, -0.5 * sceneHeight * scale, 0)
	}, [sceneWidth, sceneHeight, scale])

	// Geometry/Material are stable; count derives from particles length
	const geometry = useMemo(() => new THREE.SphereGeometry(0.25), [])

	const material = useMemo(() => {
		const mat = new THREE.MeshToonMaterial({
			color: 0xffffff,
			emissive: 0xffffff,
			emissiveIntensity: 7,
			// map: alphaMap,
			// alphaMap: alphaMap,
			// depthTest: false,
			// depthWrite: true,
			opacity,
			transparent: false,
			// alphaTest: 0.1,
			// side: THREE.DoubleSide,
		})
		return mat
	}, [alphaMap, opacity])

	return (
		<group position={anchorPosition} scale={scale}>
			<instancedMesh ref={instancedRef} args={[geometry, material, particles.length]}>
				{/* No children — matrices drive the instances */}
			</instancedMesh>
		</group>
	)
}


