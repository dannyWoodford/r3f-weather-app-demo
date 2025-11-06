import { ComponentType } from 'react'
import { BsBox, BsTree } from 'react-icons/bs'
import { LuCone, LuCylinder, LuTorus } from 'react-icons/lu'
import { ImSphere } from 'react-icons/im'
import type { PrimitiveType } from './types'

export function getIconForType(type: PrimitiveType | string): ComponentType {
  switch (type) {
    case 'box':
      return BsBox
    case 'sphere':
      return ImSphere
    case 'cone':
      return LuCone
    case 'torus':
      return LuTorus
    case 'cylinder':
      return LuCylinder
    default:
      return BsTree
  }
}


