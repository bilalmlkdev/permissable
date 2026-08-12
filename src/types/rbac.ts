/**
 * Core RBAC domain model.
 *
 * The graph has three node kinds:
 *  - Role       (can inherit from other roles - "manager" extends "employee")
 *  - Permission (a verb, e.g. "read", "write", "delete", "approve")
 *  - Resource   (a noun, can be hierarchical - "org > project > task")
 *
 * A GRANT edge connects Role -> Permission -> Resource conceptually, but is
 * modeled as a single edge: Role --[grants]--> (Permission on Resource).
 * so store grants as first-class objects referencing all three, which makes
 * "can user X do Y on Z" a simple traversal instead of a triple-join.
 */

export type NodeKind = 'role' | 'permission' | 'resource'

export interface RBACNode {
  id: string
  kind: NodeKind
  name: string
  /** For resources: parent resource id, enabling hierarchy (inherits grants downward) */
  parentId?: string | null
  /** For roles: role ids this role inherits permissions from */
  extends?: string[]
  description?: string
  position: { x: number; y: number }
}

export interface Grant {
  id: string
  roleId: string
  permissionId: string
  resourceId: string
  /** if true, grant also applies to all descendant resources */
  cascade: boolean
  /** optional condition label, e.g. "own records only" - informational, exported as a comment/hook */
  condition?: string
}

export interface User {
  id: string
  name: string
  roleIds: string[]
}

export interface RBACGraph {
  nodes: RBACNode[]
  grants: Grant[]
  users: User[]
}

export interface SimulationResult {
  allowed: boolean
  matchedGrants: Grant[]
  reasoning: string[]
}
