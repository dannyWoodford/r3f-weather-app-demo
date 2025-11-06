export const PRIMITIVE_TYPES = ['box', 'sphere', 'cone', 'torus', 'cylinder'] as const
export type PrimitiveType = typeof PRIMITIVE_TYPES[number]


