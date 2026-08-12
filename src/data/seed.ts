import type { RBACGraph } from '../types/rbac'

export function seedGraph(): RBACGraph {
  const nodes: RBACGraph['nodes'] = [
    // Roles
    { id: 'role_employee', kind: 'role', name: 'Employee', position: { x: 40, y: 60 }, extends: [] },
    { id: 'role_manager', kind: 'role', name: 'Manager', position: { x: 40, y: 200 }, extends: ['role_employee'] },
    { id: 'role_admin', kind: 'role', name: 'Admin', position: { x: 40, y: 340 }, extends: ['role_manager'] },

    // Permissions
    { id: 'perm_read', kind: 'permission', name: 'read', position: { x: 380, y: 40 } },
    { id: 'perm_write', kind: 'permission', name: 'write', position: { x: 380, y: 140 } },
    { id: 'perm_delete', kind: 'permission', name: 'delete', position: { x: 380, y: 240 } },
    { id: 'perm_approve', kind: 'permission', name: 'approve', position: { x: 380, y: 340 } },

    // Resources (hierarchy: org > project > task)
    { id: 'res_org', kind: 'resource', name: 'Organization', position: { x: 720, y: 40 }, parentId: null },
    { id: 'res_project', kind: 'resource', name: 'Project', position: { x: 720, y: 160 }, parentId: 'res_org' },
    { id: 'res_task', kind: 'resource', name: 'Task', position: { x: 720, y: 280 }, parentId: 'res_project' },
  ]

  const grants: RBACGraph['grants'] = [
    { id: 'g1', roleId: 'role_employee', permissionId: 'perm_read', resourceId: 'res_project', cascade: true },
    { id: 'g2', roleId: 'role_employee', permissionId: 'perm_write', resourceId: 'res_task', cascade: false },
    { id: 'g3', roleId: 'role_manager', permissionId: 'perm_write', resourceId: 'res_project', cascade: true },
    { id: 'g4', roleId: 'role_manager', permissionId: 'perm_approve', resourceId: 'res_task', cascade: false },
    { id: 'g5', roleId: 'role_admin', permissionId: 'perm_delete', resourceId: 'res_org', cascade: true },
  ]

  const users: RBACGraph['users'] = [
    { id: 'user_alice', name: 'Alice (Employee)', roleIds: ['role_employee'] },
    { id: 'user_bob', name: 'Bob (Manager)', roleIds: ['role_manager'] },
    { id: 'user_carol', name: 'Carol (Admin)', roleIds: ['role_admin'] },
  ]

  return { nodes, grants, users }
}
