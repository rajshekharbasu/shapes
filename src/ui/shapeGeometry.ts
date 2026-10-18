import * as THREE from 'three'
import type { ShapeKind } from '../editor/model'
import { restPose } from './projectMesh'

export function createShapeGeometry(kind: ShapeKind, forSolid = false): THREE.BufferGeometry {
  if (kind === 'box') return new THREE.BoxGeometry(1, 1, 1)
  if (kind === 'sphere') return new THREE.SphereGeometry(0.5, 32, 24)
  if (kind === 'cone') return new THREE.ConeGeometry(0.5, 1, 28)
  if (kind === 'cylinder') return new THREE.CylinderGeometry(0.5, 0.5, 1, 28)
  if (kind === 'torus') return new THREE.TorusGeometry(0.35, 0.16, 16, 32)
  if (kind === 'capsule') return new THREE.CapsuleGeometry(0.28, 0.55, 8, 16)
  if (forSolid) {
    const slab = new THREE.BoxGeometry(1, 1, 0.08)
    slab.rotateX((restPose('plane').rotateX * Math.PI) / 180)
    return slab
  }
  return new THREE.PlaneGeometry(1, 1)
}
