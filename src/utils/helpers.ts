import { Matrix4, Vector3, Quaternion, Euler } from 'three'

type Vec3Obj = { x: number; y: number; z: number }
type Vec3Arr = [number, number, number]

function toVector3(v: Vec3Obj | Vec3Arr): Vector3 {
	return Array.isArray(v) ? new Vector3(v[0], v[1], v[2]) : new Vector3(v.x, v.y, v.z)
}

function toQuaternionFromEuler(e: Vec3Obj | Vec3Arr): Quaternion {
	const euler = Array.isArray(e) ? new Euler(e[0], e[1], e[2]) : new Euler(e.x, e.y, e.z)
	return new Quaternion().setFromEuler(euler)
}

// Compose a Matrix4 from position and optional rotation/scale and return as float[16]
export function buildMatrix(
	position: Vec3Obj | Vec3Arr,
	rotation?: Vec3Obj | Vec3Arr,
	scale?: Vec3Obj | Vec3Arr
): number[] {
	const m = new Matrix4()
	const p = toVector3(position)
	const q = rotation ? toQuaternionFromEuler(rotation) : new Quaternion().identity()
	const s = scale ? toVector3(scale) : new Vector3(1, 1, 1)
	m.compose(p, q, s)
	return m.toArray()
}


