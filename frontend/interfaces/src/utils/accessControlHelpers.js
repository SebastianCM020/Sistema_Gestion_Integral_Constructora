import { getSystemErrorByCode } from '../data/mockSystemErrors.js';
import { permissionContextCatalog, validationExampleCatalog } from '../data/mockValidationRules.js';

export function canAccessValidationReference(currentUser) {
  return currentUser?.roleName === 'Administrador del Sistema';
}

export function buildPermissionContextCards(currentUser) {
  return permissionContextCatalog.map((item) => ({
    ...item,
    currentRole: currentUser?.roleName ?? 'Sin rol',
  }));
}

export function getValidationExampleOptions() {
  return validationExampleCatalog;
}

export function getPreviewStateByCode(code) {
  return getSystemErrorByCode(code);
}